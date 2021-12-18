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

  fs.writeFileSync("./build/Manifest.dsx", xml, function (err) {
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

  fs.writeFileSync("./build/Supplement.dsx", xml, function (err) {
    if (err) throw err;
  });
};

// Extracts our zip file
const extractZip = async (archivePath) => {
  console.log(app.getAppPath());

  try {
    const zip = new StreamZip.async({ file: archivePath });
    console.log("loading zip file");

    if (fs.existsSync("build")) {
      console.log("build exists, clearing folder");
      fs.emptyDirSync("build");
    } else {
      console.log("making new build folder");
      fs.mkdirSync("build");
    }

    // TODO: Extract this to a build folder
    console.log("extracting zip contents");
    await zip.extract(null, `${app.getAppPath()}/build/Content`);

    console.log("contents extracted to build");
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
          path.join(dir, file).replace(/\\/g, "/").replace("build/", "")
        );
  });
  return filelist;
};

// TODO: Need a way to drag/drop to add an image
//* Image copied to /Runtime/Support folder (BEFORE manifest is generated)
//* Image is renamed to match naiming convention of DAZ_3D_996${ProductID-1}_${Product Name}.jpg

const buildZip = (productName) => {
  zipper.sync.zip("./build/").compress().save(`./output/${productName}.zip`);
};

async function createDimPackage(args) {
  const { archivePath, productId, productName, prefix } = args;
  console.log("creating package");

  //---await extractZip(archivePath);
  //const files = getEntries("./build");

  //buildManifest(files);
  //buildSupplement("Test Product");

  // TODO: Build a zip product name using the following:
  //* ${Prefix}${ID starting with a 9 and padded with 0s, so an ID of 345 would be 90000345}-${01}_${Product Name}_ND

  //buildZip("RO02623995-01_TestArchive");
}

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

  event.reply("create-dim-package-reply", "finished!");
});
