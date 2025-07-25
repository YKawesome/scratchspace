import { useState } from 'react'

function App() {
  const [selectedColor, setSelectedColor] = useState(null)
  const [gridColors, setGridColors] = useState(Array(64).fill('bg-white'))
  const [isEraserSelected, setIsEraserSelected] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const clearCanvas = () => {
    setGridColors(Array(64).fill('bg-white'))
    document.getElementById('clear_modal').close()
  }

  const openClearModal = () => {
    document.getElementById('clear_modal').showModal()
  }

  const exportDrawing = () => {
    const colors = ['bg-white', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400', 'bg-blue-400', 'bg-indigo-400', 'bg-purple-400', 'bg-pink-400'];
    
    // Convert grid colors to 4-bit values (0-8)
    const colorIndices = gridColors.map(color => {
      const index = colors.indexOf(color);
      return index === -1 ? 0 : index; // Default to 0 (white) if not found
    });
    
    // Pack two 4-bit values into each byte and convert to hex
    let hexString = '';
    for (let i = 0; i < colorIndices.length; i += 2) {
      const high = colorIndices[i] || 0;
      const low = colorIndices[i + 1] || 0;
      const byte = (high << 4) | low;
      hexString += byte.toString(16).padStart(2, '0');
    }
    
    // Copy to clipboard
    navigator.clipboard.writeText(hexString).then(() => {
      alert('Drawing exported to clipboard! You can paste it somewhere to save it.')
    }).catch(() => {
      // Fallback: show in modal
      document.getElementById('export_modal_content').textContent = hexString
      document.getElementById('export_modal').showModal()
    })
  }

  const importDrawing = () => {
    document.getElementById('import_modal').showModal()
  }

  const processImport = () => {
    const importData = document.getElementById('import_textarea').value.trim()
    if (!importData) {
      alert('Please paste your drawing data first.')
      return
    }

    // Check if it's a hex string (64 hex chars = 32 bytes = 64 4-bit values)
    if (!/^[0-9a-fA-F]{64}$/.test(importData)) {
      alert('Invalid format. Expected 64 hex characters (0-9, a-f).')
      return
    }

    try {
      const colors = ['bg-white', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400', 'bg-blue-400', 'bg-indigo-400', 'bg-purple-400', 'bg-pink-400'];
      
      // Convert hex string to color indices
      const colorIndices = [];
      for (let i = 0; i < importData.length; i += 2) {
        const byte = parseInt(importData.slice(i, i + 2), 16);
        const high = (byte >> 4) & 0xF;
        const low = byte & 0xF;
        colorIndices.push(high, low);
      }
      
      // Convert indices to color classes
      const newGridColors = colorIndices.map(index => {
        return colors[index] || 'bg-white';
      });
      
      setGridColors(newGridColors)
      document.getElementById('import_modal').close()
      document.getElementById('import_textarea').value = ''
      alert('Drawing imported successfully!')
      
    } catch (error) {
      alert('Invalid hex data format.')
    }
  }

  const handleMouseDown = (index) => {
    setIsDragging(true);
    applyColor(index);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseEnter = (index) => {
    if (isDragging) {
      applyColor(index);
    }
  };

  const applyColor = (index) => {
    const colors = ['bg-white', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400', 'bg-blue-400', 'bg-indigo-400', 'bg-purple-400', 'bg-pink-400'];
    const newGridColors = [...gridColors];
    if (isEraserSelected) {
      newGridColors[index] = 'bg-white';
    } else if (selectedColor !== null) {
      newGridColors[index] = colors[selectedColor];
    }
    setGridColors(newGridColors);
  };

  return (
    <>
    <div className="hero bg-base-200 min-h-screen">
  <div className="hero-content text-center">
    <div className="max-w-md">
      <div className="grid grid-cols-8 gap-0 w-64 h-64 mx-auto">
        {Array.from({ length: 64 }, (_, i) => {
          const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400', 'bg-blue-400', 'bg-indigo-400', 'bg-purple-400', 'bg-pink-400'];
          
          const handleSquareClick = () => {
            const newGridColors = [...gridColors];
            if (isEraserSelected) {
              newGridColors[i] = 'bg-white';
            } else if (selectedColor !== null) {
              newGridColors[i] = colors[selectedColor];
            }
            setGridColors(newGridColors);
          };

          return (
            <div 
              key={i} 
              className={`w-8 h-8 ${gridColors[i]} hover:border cursor-pointer ${isEraserSelected ? ' hover:bg-gray-400' : ''}`}
              onMouseDown={() => handleMouseDown(i)}
              onMouseUp={handleMouseUp}
              onMouseEnter={() => handleMouseEnter(i)}
            ></div>
          );
        })}
      </div>
      <div className="grid grid-cols-8 gap-0 w-64 h-8 mx-auto mt-4">
        {Array.from({ length: 8 }, (_, i) => {
          const colors = ['bg-white', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400', 'bg-blue-400', 'bg-indigo-400', 'bg-purple-400', 'bg-pink-400'];
          const isSelected = selectedColor === i + 1; // Adjust index to match colors array
          return (
            <div 
              key={i + 64} 
              className={`w-8 h-8 ${colors[i + 1]} cursor-pointer border-2 ${isSelected ? 'border-black' : 'border-transparent'} hover:border-gray-500`}
              onClick={() => {
                setSelectedColor(isSelected ? null : i + 1); // Adjust index to match colors array
                setIsEraserSelected(false);
              }}
            ></div>
          );
        })}
      </div>
      <div className="flex justify-center gap-2 mt-4 w-full">
        <button
          className={`px-3 py-1 w-1/2 rounded border-2 cursor-pointer ${isEraserSelected ? 'border-black bg-gray-200' : 'border-gray-400 bg-white'} hover:border-gray-600`}
          onClick={() => {
            setIsEraserSelected(!isEraserSelected);
            setSelectedColor(null);
          }}
        >
          🧽 Eraser
        </button>
        <button
          className="px-3 py-1 w-1/2 rounded border-2 border-red-400 bg-red-100 hover:bg-red-200 cursor-pointer"
          onClick={openClearModal}
        >
          🗑️ Clear
        </button>
      </div>
      <div className="mt-2 w-full">
        <button
          className="px-3 py-1 w-full rounded border-2 border-blue-400 bg-blue-100 hover:bg-blue-200 cursor-pointer"
          onClick={exportDrawing}
        >
          📤 Export Drawing
        </button>
      </div>
      <div className="mt-2 w-full">
        <button
          className="px-3 py-1 w-full rounded border-2 border-green-400 bg-green-100 hover:bg-green-200 cursor-pointer"
          onClick={importDrawing}
        >
          📥 Import Drawing
        </button>
      </div>
    </div>
  </div>
</div>

<dialog id="clear_modal" className="modal">
  <div className="modal-box">
    <h3 className="font-bold text-lg">Clear Canvas?</h3>
    <p className="py-4">Are you sure you want to clear the entire canvas? This action cannot be undone.</p>
    <div className="modal-action">
      <form method="dialog">
        <button className="btn mr-2">Cancel</button>
        <button className="btn btn-error" onClick={clearCanvas}>Clear Canvas</button>
      </form>
    </div>
  </div>
</dialog>

<dialog id="export_modal" className="modal">
  <div className="modal-box">
    <h3 className="font-bold text-lg">Export Drawing</h3>
    <p className="py-2">Your drawing data (fallback):</p>
    <textarea 
      id="export_modal_content"
      className="textarea textarea-bordered w-full h-32 text-xs"
      readOnly
    ></textarea>
    <div className="modal-action">
      <form method="dialog">
        <button className="btn">Close</button>
      </form>
    </div>
  </div>
</dialog>

<dialog id="import_modal" className="modal">
  <div className="modal-box">
    <h3 className="font-bold text-lg">Import Drawing</h3>
    <p className="py-2">Paste your drawing data below:</p>
    <textarea 
      id="import_textarea"
      className="textarea textarea-bordered w-full h-32 text-xs"
      placeholder="Paste your 64-character hex string here (e.g., 1234abcd...)..."
    ></textarea>
    <div className="modal-action">
      <form method="dialog">
        <button className="btn mr-2">Cancel</button>
        <button type="button" className="btn btn-primary" onClick={processImport}>Import Drawing</button>
      </form>
    </div>
  </div>
</dialog>
    </>
  )
}

export default App
