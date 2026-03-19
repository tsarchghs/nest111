import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import TableSelection from './pages/TableSelection';
import OrderView from './pages/OrderView';
import CheckoutView from './pages/CheckoutView';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TableSelection />} />
        <Route path="/table/:tableId" element={<OrderView />} />
        <Route path="/checkout/:orderId" element={<CheckoutView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
