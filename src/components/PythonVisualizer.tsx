import React, { useEffect, useRef, useState } from "react";
import { loadPyodide } from "pyodide";

const DEFAULT_VISUALIZATION_CODE = `import numpy as np
import matplotlib.pyplot as plt

# Create data for decadal temperature changes
decades = ['1980s', '1990s', '2000s', '2010s', '2020s']
temp_increase = [0.18, 0.25, 0.37, 0.52, 0.68]  # Representative values based on NASA data

plt.figure(figsize=(10, 6))
colors = plt.cm.YlOrRd(np.linspace(0.3, 0.9, len(decades)))
bars = plt.bar(decades, temp_increase, color=colors)

# Add value labels on top of each bar
for bar in bars:
    height = bar.get_height()
    plt.text(bar.get_x() + bar.get_width()/2., height,
             f'{height:.2f}°C',
             ha='center', va='bottom')

plt.grid(True, axis='y', alpha=0.3)
plt.xlabel('Decade')
plt.ylabel('Temperature Anomaly (°C)')
plt.title('Global Temperature Anomaly by Decade\\n(Relative to 1951-1980 average)')

# Add a trend line
x = np.arange(len(decades))
z = np.polyfit(x, temp_increase, 1)
p = np.poly1d(z)
plt.plot(x, p(x), "r--", alpha=0.8, label='Warming Trend')
plt.legend()

plt.tight_layout()`;

interface VisualizationData {
  type: string;
  code: string;
}

interface Props {
  pythonCode?: string;
}

const PythonVisualizer: React.FC<Props> = ({ pythonCode }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const plotContainerRef = useRef<HTMLDivElement>(null);

  console.log("pythonCode", pythonCode);

  useEffect(() => {
    const executePython = async () => {
      try {
        setLoading(true);
        setError(null);

        // Initialize Pyodide
        const pyodide = await loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.2/full/",
        });

        // Install required packages
        await pyodide.loadPackage([
          "numpy",
          "matplotlib",
          "pandas",
          "micropip",
        ]);

        // Install seaborn using micropip
        await pyodide.runPythonAsync(`
          import micropip
          await micropip.install('seaborn')
        `);

        // Setup matplotlib for web output with proper configuration
        await pyodide.runPythonAsync(`
          import matplotlib
          matplotlib.use('AGG')
          import matplotlib.pyplot as plt
          plt.ioff()  # Turn off interactive mode
          import io, base64
        `);

        // Execute the visualization code (keeping plt.show())
        await pyodide.runPythonAsync(pythonCode);

        // Ensure the figure is rendered and capture it
        await pyodide.runPythonAsync(`
          plt.draw()  # Ensure the figure is rendered
          buffer = io.BytesIO()
          plt.savefig(buffer, format='png', bbox_inches='tight')
          plt.close('all')  # Clean up
          plot_data = base64.b64encode(buffer.getvalue()).decode('utf-8')
        `);

        // Get the base64 image data
        const plotData = pyodide.globals.get("plot_data").toString();

        if (plotContainerRef.current) {
          plotContainerRef.current.innerHTML = `
            <img src="data:image/png;base64,${plotData}" alt="Python visualization" />
          `;
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to execute Python code"
        );
      } finally {
        setLoading(false);
      }
    };

    if (pythonCode) {
      executePython();
    }
  }, [pythonCode]);

  if (loading) {
    return <div>Loading visualization...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return <div ref={plotContainerRef} />;
};

export default PythonVisualizer;
