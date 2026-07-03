import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import Home from './pages/Home';
import OrderForm from './pages/OrderForm';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-200 dark:bg-gray-900 dark:text-gray-100">
          {/* Header/Navbar (Hidden on print) */}
          <header className="bg-white border-b border-gray-200 py-4 px-6 no-print dark:bg-gray-800 dark:border-gray-700">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="h-9 w-9 bg-indigo-650 rounded-lg flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-indigo-200 dark:shadow-none">
                  SO
                </span>
                <span className="text-lg font-bold text-gray-900 tracking-tight dark:text-white">
                  Sales Order <span className="text-indigo-600">Portal</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-medium">v1.0.0</span>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="transition-all duration-200">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/order/:id" element={<OrderForm />} />
            </Routes>
          </main>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
