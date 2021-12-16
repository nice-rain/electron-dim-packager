import './App.scss';
import { useState } from 'react';

function App() {

  const [prefix, setPrefix] = useState('RO');
  const [archivePath, setArchivePath] = useState('');
  const [paddedId, setPaddedId] = useState('');
  const [productId, setProductId] = useState('');
  const [productName, setProductName] = useState('');
  const [output, setOutput] = useState('');

  const updatePrefix = e => {
    setPrefix(e.target.value.toUpperCase());
  }

  const handleFileChange = e => {
    if (!e.target.files[0]) return;
    setArchivePath(e.target.files[0].path);
  }

  const updateProductId = e => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    let newId = '9';

    const paddedId = value < 9999999 ? `000000${value}`.slice(-7) : value;

    newId += String(paddedId);

    setPaddedId(newId);
    setProductId(value);
  }

  const updateProductName = e => setProductName(e.target.value);

  const handleFormSubmit = e => {
    e.preventDefault();

    //TODO: Combine node-dim with this application on submit
    setOutput(
      prefix + archivePath + paddedId + productName
    )
  }

  return (
    <div className="App">
      {/* <header className="App-header"><h1>DIM Packager</h1></header> */}
      <main>
        <form onSubmit={handleFormSubmit}>
          <label htmlFor="prefix">Prefix</label>
          <input id="prefix" className="prefix" type="text" placeholder='Prefix' maxLength={3} value={prefix} onChange={updatePrefix} required />
          <label htmlFor="product-id">Product Id</label>
          <input id="product-id" type="text" placeholder='Up to 7 Numbers' onChange={updateProductId} value={productId} maxLength={7} required />
          <label htmlFor="product-name">Product Name</label>
          <input id="product-name" type="text" placeholder='Product Name' onChange={updateProductName} value={productName} required />
          <input id="archive" type="file" placeholder="Archive" onChange={handleFileChange} required />
          <button>Submit</button>
        </form>

        <div className="output">
          <p>Output:</p>
          <div className="output-window">
            {output}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
