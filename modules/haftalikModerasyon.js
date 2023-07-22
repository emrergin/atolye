const Kullanici = require("../models/kullanici");
const Server = require("../models/server");
const Oyku = require("../models/oyku");
const Yorum = require("../models/yorum");
const Kelime = require("../models/kelime");

module.exports = async function haftalikModerasyon() {
  const moderasyonVerisi = await Server.findOne();
  const lastWeek = moderasyonVerisi.hafta;

  const storyFromFourWeeksAgo = await Oyku.findOne({ hafta: lastWeek - 3 });
  const storyFromLastWeek = await Oyku.findOne({ hafta: lastWeek });
  const relatedDate = storyFromFourWeeksAgo.createdAt;
  if (storyFromLastWeek) {
    await Server.updateOne(
      {},
      { $set: { hafta: moderasyonVerisi.hafta + 1, break: false } }
    );
  } else {
    await Server.updateOne({}, { $set: { break: false } });
  }
  await Kullanici.updateMany(
    { katilim: "yazacak" },
    { $set: { aktif: false, katilim: "yazmayacak" } }
  );
  await yorumDeaktifTemizligi();
  await yorumYuzdeleri(relatedDate);
  await yorumAta();
  await Promise.all([
    yorumYuzdeleri(),
    gorevYenile(),
    Kullanici.updateMany(
      { katilim: "yazdi" },
      { $set: { katilim: "yazmayacak" } }
    ),
  ]);
  return lastWeek;

  async function yorumYuzdeleri(relatedDate) {
    let degerlendirilecekYorumlar = await Yorum.find(
      { createdAt: { $gt: relatedDate } },
      { yorumcu: 1, yazarOnayi: 1, yorumcuOnayi: 1, _id: 0 }
    );

    degerlendirilecekYorumlar = degerlendirilecekYorumlar
      .sort(compare)
      .map((a) => {
        return {
          yorumcu: a.yorumcu,
          deger: +(a.yorumcuOnayi && a.yazarOnayi !== false),
        };
      });

    const sonuc = [];
    for (let satir of degerlendirilecekYorumlar) {
      if (
        sonuc.length &&
        sonuc[sonuc.length - 1].yorumcu.toString() === satir.yorumcu.toString()
      ) {
        sonuc[sonuc.length - 1].deger += satir.deger;
        sonuc[sonuc.length - 1].sayac++;
      } else {
        satir.sayac = 1;
        sonuc.push(satir);
      }
    }

    for (let satir of sonuc) {
      satir.ortalama = satir.deger / satir.sayac;
    }

    for await (let sonucSatiri of sonuc) {
      let doc = await Kullanici.findById(sonucSatiri.yorumcu);
      doc.yorumYuzdesi = sonucSatiri.ortalama;
      await doc.save();
    }

    function compare(a, b) {
      if (a.yorumcu < b.yorumcu) {
        return -1;
      }
      if (a.yorumcu > b.yorumcu) {
        return 1;
      }
      return 0;
    }
  }

  async function yorumDeaktifTemizligi() {
    let gidenler = await Kullanici.find({ aktif: false }, { _id: 1 });
    if (gidenler.length) {
      gidenler = gidenler.map((a) => a._id.toString());
      await Yorum.deleteMany({ yorumcu: { $in: gidenler } });
      // await Yorum.deleteMany({createdAt: {$lt: relatedDate}});
      await Yorum.updateMany(
        { yazar: { $in: gidenler } },
        { $set: { yazarOnayi: true } }
      );
    }
  }

  async function yorumAta() {
    let yorumlanacaklar = await Oyku.find(
      { yorumAtamasi: false },
      { yazarObje: 1, baslik: 1, link: 1 }
    )
      .populate("yazarObje", "yorumYuzdesi")
      .lean();
    let yorumlayacaklar = await Kullanici.find(
      { aktif: true, sekil: "okurYazar" },
      { _id: 1, yorumYuzdesi: 1, gercekAd: 1 }
    );

    if (yorumlanacaklar.length && yorumlayacaklar.length > 1) {
      let topAgirlik = 0;
      for (let oyku of yorumlanacaklar) {
        topAgirlik += parseFloat(oyku.yazarObje.yorumYuzdesi) ** 1.5;
      }
      if (topAgirlik !== 0) {
        let toplamYorumSayisi = yorumlayacaklar.length * 3;

        // let oykuMatrisi=[];
        let oykuMatrisi = yorumlanacaklar.map((oyku, index) => {
          let agirlik =
            parseFloat(oyku.yazarObje.yorumYuzdesi) ** 1.5 / topAgirlik;
          return {
            ...oyku,
            yakYorumSayisi: Math.min(
              Math.ceil(toplamYorumSayisi * agirlik),
              yorumlayacaklar.length - 1
            ),
            indis: index,
          };
        });

        // Yorum Dagitimi burada basliyor=====================
        var yorumMatrisi = [];
        var tamamMatrisi = [];

        oykuMatrisi
          .filter((i) => i.yakYorumSayisi <= 0)
          .forEach((bitenOyku) => {
            tamamMatrisi.push(bitenOyku._id);
          });
        oykuMatrisi = shuffle(oykuMatrisi.filter((i) => i.yakYorumSayisi > 0));
        yorumlayacaklar = shuffle(yorumlayacaklar);

        for (let yorumcu of yorumlayacaklar) {
          let buKisininYorumlayabilecegiOykuler = oykuMatrisi.filter(
            (i) => i.yazarObje._id.toString() !== yorumcu._id.toString()
          );
          let secilenler = buKisininYorumlayabilecegiOykuler.slice(0, 3);

          for (let secilenOyku of secilenler) {
            let yorumObje = {};
            yorumObje.baslik = secilenOyku.baslik;
            yorumObje.link = secilenOyku.link;
            yorumObje.yorumlayan = yorumcu._id;
            yorumObje.gercekAd = yorumcu.gercekAd;
            yorumObje.yorumlanan = secilenOyku.yazarObje._id;
            yorumMatrisi.push(yorumObje);
            let indeks = oykuMatrisi.findIndex(
              (a) => a.indis === secilenOyku.indis
            );
            oykuMatrisi[indeks].yakYorumSayisi -= 1;
          }

          oykuMatrisi
            .filter((i) => i.yakYorumSayisi <= 0)
            .map((bitenOyku) => {
              tamamMatrisi.push(bitenOyku._id);
            });
          oykuMatrisi = oykuMatrisi
            .filter((i) => i.yakYorumSayisi > 0)
            .sort((a, b) => a.yakYorumSayisi - b.yakYorumSayisi);

          if (!oykuMatrisi.length) {
            break;
          }
        }
        //hala yorumlari tamamlanmamis varsa, tamamla.
        oykuMatrisi.forEach((bitenOyku) => {
          tamamMatrisi.push(bitenOyku._id);
        });
      }
      for await (let yorum of yorumMatrisi) {
        const yYorum = new Yorum({
          baslik: yorum.baslik,
          link: yorum.link,
          yazar: yorum.yorumlanan,
          yorumcu: yorum.yorumlayan,
          yorumcuIsim: yorum.gercekAd,
        });
        await yYorum.save();
      }

      for await (bitenOyku of tamamMatrisi) {
        await Oyku.updateOne(
          { _id: bitenOyku },
          { $set: { yorumAtamasi: true } }
        );
      }
    }
  }

  async function gorevYenile() {
    try {
      const yazanlar = await Kullanici.find({ katilim: "yazdi" });
      if (yazanlar.length > 0) {
        const yeniKelimeler = await Kelime.aggregate([
          { $sample: { size: 3 } },
          { $project: { kelime: 1, _id: 0 } },
        ]);
        await Server.updateOne(
          {},
          { $set: { gorev: yeniKelimeler.map((a) => a.kelime).join(", ") } }
        );
      }
    } catch (e) {
      console.log("caught", e);
    }
  }

  function shuffle(array) {
    let resArray = array;
    for (let i = resArray.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [resArray[i], resArray[j]] = [resArray[j], resArray[i]];
    }
    return resArray;
  }
};
