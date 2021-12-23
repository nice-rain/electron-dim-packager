const StreamZip = require("node-stream-zip");
const path = require("path");
const builder = require("xmlbuilder");
const { v4: uuidv4 } = require("uuid");
var zipper = require("zip-local");
const fs = require("fs-extra");
const { ipcMain } = require("electron");
const app = require("electron").app;

// Builds and outputs the Manifest.dsx
const buildManifest = (files) => {
  console.log("Building Manifest");

  // Generate our XML file
  // Create our root
  const root = builder.begin().ele("DAZInstallManifest");
  root.att("VERSION", "0.1");

  // Add our global ID
  const globalId = root.ele("GlobalID");
  globalId.att("VALUE", uuidv4());

  // Add a tag for our manifest generation
  // root.ele('NODE_DIM', {VERSION: '0.0.1'});

  // Loop through all files and append to manifest
  files.forEach((file) => {
    const newEntry = root.ele("File");
    newEntry.att("TARGET", "Content");
    newEntry.att("ACTION", "Install");
    newEntry.att("VALUE", file);
  });

  const xml = root.end({ pretty: true });

  fs.writeFileSync("./input/Manifest.dsx", xml, function (err) {
    if (err) throw err;
  });
};

// Builds and outputs our Supplement.dsx file
const buildSupplement = (productName) => {
  console.log("Building Supplement");
  const root = builder.begin().ele("ProductSupplement");
  root.att("VERSION", "0.1");

  // Add a tag for our manifest generation
  // root.ele('NODE_DIM', {VERSION: '0.0.1'});

  root.ele("ProductName", { VALUE: productName });
  root.ele("InstallTypes", { VALUE: "Content" });
  root.ele("ProductTags", { VALUE: "DAZStudio4_5" });

  const xml = root.end({ pretty: true });

  fs.writeFileSync("./input/Supplement.dsx", xml, function (err) {
    if (err) throw err;
  });
};

// Extracts our zip file
const extractZip = async (archivePath) => {
  console.log(app.getAppPath());

  try {
    const zip = new StreamZip.async({ file: archivePath });
    console.log("loading zip file");

    if (fs.existsSync("input")) {
      console.log("input exists, clearing folder");
      fs.emptyDirSync("input");
    } else {
      console.log("making new build folder");
      fs.mkdirSync("input");
    }

    // TODO: Extract this to a build folder
    console.log("extracting zip contents");
    await zip.extract(null, `${app.getAppPath()}/input/Content`);

    console.log("contents extracted to input");
    await zip.close();
  } catch (e) {
    console.log(e.message);
  }
};

// Returns all entries within our extracted zip folder
const getEntries = (dir, filelist = []) => {
  console.log("Getting all entries");
  console.log({ dir });

  fs.readdirSync(dir).forEach((file) => {
    filelist = fs.statSync(path.join(dir, file)).isDirectory()
      ? getEntries(path.join(dir, file), filelist)
      : filelist.concat(
          path.join(dir, file).replace(/\\/g, "/").replace("input/", "")
        );
  });
  return filelist;
};

const buildZip = (productName) => {
  // make sure we have an output folder
  if (!fs.existsSync("output")) {
    console.log("output exists, clearing folder");
    fs.mkdirSync("output");
  }

  zipper.sync.zip("./input/").compress().save(`./output/${productName}.zip`);
};

// Empty our input folder to restore it to the original state
const cleanInputFolder = async () => {
  try {
    if (fs.existsSync("input")) {
      console.log("Resetting input folder");
      fs.emptyDirSync("input");
      fs.mkdirSync("input/Content");
    }
  } catch (e) {
    console.log(e.message);
  }
};

// Synchronous
ipcMain.on("create-dim-package", async (event, args) => {
  console.log("Received IPC Message", args);

  // Extract our arguments
  const { archivePath, productId, productName, prefix, useZip } = args;

  // Check to see if we are loading a zip file
  if (useZip) {
    event.reply("create-dim-package-reply", "Unpacking zip file");
    await extractZip(archivePath);
  }

  // Get our file directory structure
  event.reply("create-dim-package-reply", "Building directory structure");
  const files = getEntries("./input");

  event.reply("create-dim-package-reply", "Building manifest file");
  buildManifest(files);

  event.reply("create-dim-package-reply", "Building supplement file");
  buildSupplement(productName);

  const archiveName = `${prefix}${productId}-01_${productName.replace(
    /[^a-z0-9]+/gi,
    ""
  )}`;
  event.reply(
    "create-dim-package-reply",
    `Creating archive with name: ${archiveName}.zip`
  );
  buildZip(archiveName);

  event.reply("create-dim-package-reply", "Cleaning up input folder.");
  cleanInputFolder();

  event.reply(
    "create-dim-package-reply",
    "Finished! Archive can be found in the output folder."
  );
});
