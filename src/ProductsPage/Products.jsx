import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProductListPage from './components/ProductList';
import IndividualProductPage from './components/IndividualProduct';

const Products = () => {
  return (
    <Routes>
      <Route path="/" element={<ProductListPage />} />
      <Route path=":id" element={<IndividualProductPage />} />
    </Routes>
  );
};

export default Products;
