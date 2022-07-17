const express = require("express");
const config = require("config");
const mongoose = require("mongoose");
const app = express();
const randomstring = require("randomstring");

const PORT = config.get("port") || 4000;
const Schema = mongoose.Schema;

const cacherScheme = new Schema({
  createdAt: { type: Date, expires: 20, index: true, default: Date.now },
  cache: String,
});

const Cacher = mongoose.model("Cache", cacherScheme);

const urlencodedParser = express.urlencoded({ extended: false });

async function start() {
  try {
    await mongoose.connect(config.get("mongoUri"), {});

    // FIND ONE FILE OR CREATE RANDOM STRING
    app.post("/api/find", urlencodedParser, async (req, res) => {
      const ctx = JSON.parse(JSON.stringify(req.body));

      const data = await Cacher.findOne({ cache: `${ctx.cache}` });

      if (data) {
        console.log("Cache Hit");
        return res.status(200).send(data);
      } else {
        console.log("Cache Miss");

        const random = randomstring.generate();

        let count = await Cacher.find({});
        const leng = Object.keys(count).length;

        if (leng > 10) {
          //there I do a check for the count of elements and if there are more than 10, then we find the oldest element and overwrite it with a new value
          const elem = count[count.length - 1];

          await Cacher.findOneAndUpdate(
            { cache: elem.cache },
            { cache: random }
          );
        } else {
          const cacheFile = new Cacher({
            cache: random,
          });

          await cacheFile.save(() => {
            console.log("save cache", cacheFile);
          });
        }
        return res.status(200).send(random);
      }
    });

    // FIND ALL FILES
    app.post("/api/findAll", urlencodedParser, async (res) => {
      const data = await Cacher.find();

      if (data) {
        return res.status(200).send(data);
      } else {
        return res.status(200).send("no cache files");
      }
    });

    // UPDATE OR CREATE
    app.post("/api/update", urlencodedParser, async (req, res) => {
      const ctx = JSON.parse(JSON.stringify(req.body));

      const data = await Cacher.findOne({ cache: ctx.cache });

      if (data) {
        await Cacher.findOneAndUpdate(
          { cache: ctx.cache },
          { cache: ctx.newCache }
        );
        console.log("update file");
        return res.status(200).send("data update");
      } else {
        let count = await Cacher.find({});
        const leng = Object.keys(count).length;

        if (leng > 10) {
          const elem = count[count.length - 1];
          await Cacher.findOneAndUpdate(
            { cache: elem.cache },
            { cache: ctx.newCache }
          );
        } else {
          const cacheFile = new Cacher({
            cache: ctx.newCache,
          });

          await cacheFile.save(() => {
            console.log("save cache", cacheFile);
          });
        }
        return res.status(200).send("create new file");
      }
    });

    // DELETE ONE FILE
    app.post("/api/delete", urlencodedParser, async (req, res) => {
      const ctx = JSON.parse(JSON.stringify(req.body));

      const data = await Cacher.findOne({ cache: ctx.cache });

      if (data) {
        await Cacher.deleteOne({ cache: ctx.cache });
        console.log("delete file");
        return res.status(200).send("delete file");
      } else {
        return res.status(200).send("can`t find this file");
      }
    });

    // DELETE ALL FILES
    app.post("/api/deleteAll", urlencodedParser, async (req, res) => {
      const ctx = JSON.parse(JSON.stringify(req.body));

      const data = await Cacher.findOne();

      if (data) {
        await Cacher.deleteMany({});
        console.log("delete files");
        return res.status(200).send("delete file");
      } else {
        return res.status(200).send("no files to delete");
      }
    });

    app.listen(PORT, () =>
      console.log(`Server has been started at port ${PORT}...`)
    );
  } catch (e) {
    console.log("Server Error", e.message);
    process.exit(1);
  }
}

start();
