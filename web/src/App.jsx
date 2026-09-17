import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PlaygroundPage from './pages/PlaygroundPage';
import EndpointDocsPage from './pages/EndpointDocsPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/playground" element={<PlaygroundPage />} />
      <Route path="/endpoints" element={<EndpointDocsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
