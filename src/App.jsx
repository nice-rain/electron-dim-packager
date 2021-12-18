import "./App.scss";
import { useEffect, useState } from "react";
const { ipcRenderer } = window.require("electron");

function App() {
  const [prefix, setPrefix] = useState("RO");
  const [archivePath, setArchivePath] = useState("");
  const [paddedId, setPaddedId] = useState("");
  const [productId, setProductId] = useState("");
  const [productName, setProductName] = useState("");
  const [output, setOutput] = useState([]);
  const [useZip, setUseZip] = useState(false);

  const updatePrefix = (e) => {
    setPrefix(e.target.value.toUpperCase());
  };

  const handleFileChange = (e) => {
    if (!e.target.files[0]) return;
    setArchivePath(e.target.files[0].path);
  };

  const updateProductId = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    let newId = "9";

    const paddedId = value < 9999999 ? `000000${value}`.slice(-7) : value;

    newId += String(paddedId);

    setPaddedId(newId);
    setProductId(value);
  };

  const updateProductName = (e) => setProductName(e.target.value);
  const updateUseZip = (e) => setUseZip(e.target.checked);

  const handleFormSubmit = (e) => {
    e.preventDefault();

    // Wipe our output and start our submission
    setOutput([
      "Generating DIM Package with the following Parameters:",
      `prefix: ${prefix}`,
      `zip file: ${archivePath}`,
      `product id: ${paddedId}`,
      `product name: ${productName}`,
    ]);

    // Send an IPC to electron to create our dim package
    ipcRenderer.send("create-dim-package", {
      archivePath,
      productId: paddedId,
      productName,
      prefix,
      useZip,
    });
  };

  // Bind our IPC event listener
  useEffect(() => {
    const onData = (event, data) => {
      setOutput([...output, data]);
    };

    // Setup IPC Response - Print to our console
    ipcRenderer.on("create-dim-package-reply", onData);

    return () => {
      ipcRenderer.removeListener("create-dim-package-reply", onData);
    };
  }, [output]);

  const generateOutput = () => {
    if (!output.length) return <></>;

    return output.map((out, index) => {
      return <p key={index}>{out}</p>;
    });
  };

  return (
    <div className="App">
      {/* <header className="App-header"><h1>DIM Packager</h1></header> */}
      <main>
        <form onSubmit={handleFormSubmit}>
          <label htmlFor="prefix">Prefix</label>
          <input
            id="prefix"
            className="prefix"
            type="text"
            placeholder="Prefix"
            maxLength={3}
            value={prefix}
            onChange={updatePrefix}
            required
          />
          <label htmlFor="product-id">Product Id</label>
          <input
            id="product-id"
            type="text"
            placeholder="Up to 7 Numbers"
            onChange={updateProductId}
            value={productId}
            maxLength={7}
            required
          />
          <label htmlFor="product-name">Product Name</label>
          <input
            id="product-name"
            type="text"
            placeholder="Product Name"
            onChange={updateProductName}
            value={productName}
            required
            accept=".zip"
          />
          <div>
            <input
              id="use-zip"
              type="checkbox"
              value={useZip}
              onChange={updateUseZip}
              required
            />
            <label htmlFor="use-zip">Use Zip</label>
          </div>

          {useZip ? (
            <input
              id="archive"
              type="file"
              placeholder="Archive"
              onChange={handleFileChange}
              required
            />
          ) : (
            <p>Using /input folder to generate zip.</p>
          )}
          <button>Submit</button>
        </form>

        <div className="output">
          <p>Output:</p>
          <div className="output-window">{generateOutput()}</div>
        </div>
      </main>
    </div>
  );
}

export default App;
