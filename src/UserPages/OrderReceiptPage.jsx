import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Calendar, MapPin, CreditCard, Truck, CheckCircle, Clock, Receipt, Download, ExternalLink } from 'lucide-react';
// Import PDF generation libraries
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
// Import your actual webService
import webService from '../services/Website/WebService';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatCurrency = (amount, currency = 'AED') => {
  return `${currency.toUpperCase()} ${amount}`;
};

const StatusBadge = ({ status, type = 'default' }) => {
  const statusConfig = {
    paid: { 
      bg: 'bg-green-100', 
      text: 'text-green-800', 
      border: 'border-green-200',
      printBg: 'print:bg-green-100'
    },
    pending: { 
      bg: 'bg-yellow-100', 
      text: 'text-yellow-800', 
      border: 'border-yellow-200',
      printBg: 'print:bg-yellow-100'
    },
    failed: { 
      bg: 'bg-red-100', 
      text: 'text-red-800', 
      border: 'border-red-200',
      printBg: 'print:bg-red-100'
    },
    succeeded: { 
      bg: 'bg-green-100', 
      text: 'text-green-800', 
      border: 'border-green-200',
      printBg: 'print:bg-green-100'
    },
    default: { 
      bg: 'bg-gray-100', 
      text: 'text-gray-800', 
      border: 'border-gray-200',
      printBg: 'print:bg-gray-100'
    }
  };

  const config = statusConfig[status] || statusConfig.default;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.bg} ${config.text} ${config.border} ${config.printBg}`}>
      {status}
    </span>
  );
};

const TrackingTimeline = ({ trackingHistory = [] }) => {
  return (
    <div className="space-y-3">
      {trackingHistory.map((item, index) => (
        <div key={item._id} className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {item.status === 'pending' ? (
              <Clock className="w-5 h-5 text-yellow-500" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 capitalize">{item.status}</p>
            <p className="text-xs text-gray-500">{formatDate(item.timestamp)}</p>
            {item.note && <p className="text-xs text-gray-600 mt-1">{item.note}</p>}
          </div>
        </div>
      ))}
    </div>
  );
};

const OrderReceiptPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const receiptRef = useRef(null);
  
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

  useEffect(() => {
    const fetchReceipt = async () => {
      if (!orderId) {
        setError('Order ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Use your actual webService - just fetch the receipt data, not file
        const res = await webService.downloadOrderReceipt(orderId); // Changed method name
        
        if (res.data && res.data.success && res.data.data) {
          setReceipt(res.data.data);
        } else {
          setError('Invalid response format from server');
        }
      } catch (e) {
        console.error('Error fetching receipt:', e);
        setError(
          e.response?.data?.message || 
          e.message || 
          'Unable to fetch receipt. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReceipt();
  }, [orderId]);

  // Improved image loading with proper error handling
  const loadImageAsDataURL = (src) => {
    return new Promise((resolve) => {
      if (!src || !src.startsWith('http')) {
        resolve(getPlaceholderImage());
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = function() {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Set canvas size to image size
          canvas.width = this.width;
          canvas.height = this.height;
          
          // Draw image on canvas
          ctx.drawImage(this, 0, 0);
          
          // Convert to data URL
          const dataURL = canvas.toDataURL('image/png', 0.8);
          resolve(dataURL);
        } catch (error) {
          console.warn('Canvas conversion failed:', error);
          resolve(getPlaceholderImage());
        }
      };
      
      img.onerror = function() {
        console.warn('Image load failed:', src);
        resolve(getPlaceholderImage());
      };
      
      // Set timeout for loading
      setTimeout(() => {
        if (!img.complete) {
          img.src = '';
          resolve(getPlaceholderImage());
        }
      }, 5000);
      
      img.src = src;
    });
  };

  // Create a proper placeholder image
  const getPlaceholderImage = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 48;
    canvas.height = 48;
    
    // Draw a simple placeholder
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, 48, 48);
    
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, 48, 48);
    
    ctx.fillStyle = '#9ca3af';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('📦', 24, 24);
    
    return canvas.toDataURL('image/png');
  };

  // Significantly improved PDF generation
  const handleDownloadReceipt = async () => {
    if (!receiptRef.current) {
      setDownloadError('Receipt content not found');
      return;
    }

    setDownloadLoading(true);
    setDownloadError(null);
    
    try {
      const receiptElement = receiptRef.current;
      
      // Create a dedicated container for PDF generation
      const pdfContainer = document.createElement('div');
      pdfContainer.style.cssText = `
        position: absolute;
        top: -9999px;
        left: -9999px;
        width: 794px !important;
        min-height: 1123px;
        background: white !important;
        font-family: Arial, sans-serif !important;
        color: black !important;
        box-sizing: border-box;
        padding: 0;
        margin: 0;
      `;
      
      document.body.appendChild(pdfContainer);
      
      // Clone the receipt content
      const clonedElement = receiptElement.cloneNode(true);
      
      // Apply PDF-specific styles to the cloned element
      clonedElement.style.cssText = `
        width: 100% !important;
        background: white !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        margin: 0 !important;
        padding: 0 !important;
      `;

      // Remove print-hidden elements and fix all styling issues
      const processElement = (element) => {
        // Remove print:hidden elements
        if (element.classList && element.classList.contains('print:hidden')) {
          element.remove();
          return;
        }

        // Fix background and backdrop filters
        element.style.backdropFilter = 'none';
        element.style.webkitBackdropFilter = 'none';
        
        // Fix transparent backgrounds
        const computedStyle = window.getComputedStyle(element);
        const bgColor = computedStyle.backgroundColor;
        
        if (bgColor === 'transparent' || bgColor.includes('rgba')) {
          if (element.classList.contains('bg-red-600') || element.classList.contains('bg-pink-600')) {
            element.style.backgroundColor = '#dc2626 !important';
            element.style.color = 'white !important';
          } else if (element.classList.contains('bg-white') || bgColor.includes('rgba')) {
            element.style.backgroundColor = 'white !important';
          }
        }

        // Fix text colors
        if (element.classList.contains('text-white')) {
          element.style.color = 'white !important';
        } else if (element.classList.contains('text-gray-900')) {
          element.style.color = '#111827 !important';
        } else if (element.classList.contains('text-gray-700')) {
          element.style.color = '#374151 !important';
        } else if (element.classList.contains('text-red-600')) {
          element.style.color = '#dc2626 !important';
        }

        // Process children
        Array.from(element.children).forEach(processElement);
      };

      processElement(clonedElement);
      pdfContainer.appendChild(clonedElement);

      // Process all images and convert to data URLs
      const images = pdfContainer.querySelectorAll('img');
      const imagePromises = Array.from(images).map(async (img) => {
        try {
          const dataURL = await loadImageAsDataURL(img.src);
          img.src = dataURL;
          img.style.cssText = `
            width: 48px !important;
            height: 48px !important;
            object-fit: contain !important;
            display: block !important;
          `;
        } catch (error) {
          console.warn('Failed to process image:', error);
          // Replace with text placeholder
          const placeholder = document.createElement('div');
          placeholder.style.cssText = `
            width: 48px !important;
            height: 48px !important;
            background: #f3f4f6 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-size: 20px !important;
            border: 1px solid #d1d5db !important;
            border-radius: 4px !important;
          `;
          placeholder.textContent = '📦';
          img.parentNode.replaceChild(placeholder, img);
        }
      });

      await Promise.all(imagePromises);

      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate canvas with optimal settings for PDF
      const canvas = await html2canvas(pdfContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        width: 794,
        height: pdfContainer.scrollHeight,
        windowWidth: 794,
        windowHeight: pdfContainer.scrollHeight,
        removeContainer: false,
        imageTimeout: 15000,
        onclone: (clonedDoc, element) => {
          // Final cleanup in cloned document
          const allElements = element.querySelectorAll('*');
          allElements.forEach(el => {
            el.style.backdropFilter = 'none';
            el.style.webkitBackdropFilter = 'none';
          });
        }
      });

      // Remove the temporary container
      document.body.removeChild(pdfContainer);

      // Create PDF with proper dimensions
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasAspectRatio = canvas.height / canvas.width;
      
      // Calculate dimensions with margins
      const margin = 10;
      const availableWidth = pdfWidth - (2 * margin);
      const availableHeight = pdfHeight - (2 * margin);
      
      let imgWidth = availableWidth;
      let imgHeight = availableWidth * canvasAspectRatio;
      
      // If image is too tall, scale to fit height
      if (imgHeight > availableHeight) {
        imgHeight = availableHeight;
        imgWidth = imgHeight / canvasAspectRatio;
      }
      
      const x = (pdfWidth - imgWidth) / 2;
      const y = margin;

      // Check if we need multiple pages
      if (imgHeight > availableHeight) {
        // Multiple pages needed
        const pageHeight = availableHeight;
        const pagesNeeded = Math.ceil(canvas.height / (canvas.width * pageHeight / availableWidth));
        
        for (let page = 0; page < pagesNeeded; page++) {
          if (page > 0) pdf.addPage();
          
          const sourceY = page * (canvas.height / pagesNeeded);
          const sourceHeight = canvas.height / pagesNeeded;
          
          // Create page canvas
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = sourceHeight;
          const pageCtx = pageCanvas.getContext('2d');
          
          pageCtx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
          
          const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95);
          pdf.addImage(pageImgData, 'JPEG', x, y, imgWidth, pageHeight);
        }
      } else {
        // Single page
        pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);
      }

      // Add metadata
      pdf.setProperties({
        title: `Order Receipt - ${orderId}`,
        subject: 'Order Receipt',
        author: 'PQF Store',
        creator: 'Order Management System',
        keywords: 'receipt, order, invoice'
      });

      // Download the PDF
      const fileName = `OrderReceipt_${orderId}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('PDF generation error:', error);
      setDownloadError('Failed to generate PDF. Please try the print option instead.');
    } finally {
      setDownloadLoading(false);
    }
  };

  // Enhanced print handler
  const handlePrintReceipt = () => {
    // Create a new window with just the receipt content
    const printWindow = window.open('', '_blank');
    const receiptHTML = receiptRef.current.innerHTML;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Order Receipt - ${orderId}</title>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              background: white;
            }
            .print\\:hidden { display: none !important; }
            * { 
              -webkit-print-color-adjust: exact !important; 
              color-adjust: exact !important; 
              print-color-adjust: exact !important;
            }
            @media print {
              body { margin: 0; padding: 15mm; }
              .no-print { display: none !important; }
              * { 
                backdrop-filter: none !important;
                -webkit-backdrop-filter: none !important;
              }
            }
            img {
              max-width: 48px !important;
              max-height: 48px !important;
              object-fit: contain !important;
            }
          </style>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        </head>
        <body>
          <div style="background: white;">
            ${receiptHTML}
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg font-medium text-gray-700">Loading receipt...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md mx-auto">
          <div className="text-6xl mb-4">❌</div>
          <div className="text-red-600 text-lg font-semibold mb-4">{error}</div>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-lg font-medium text-gray-700">No receipt data available.</div>
      </div>
    );
  }

  const {
    orderId: orderIdValue,
    cardName,
    cardCode,
    orderType,
    notes,
    location,
    paymentStatus,
    price,
    orderDate,
    payment,
    shippingAddress,
    billingAddress,
    orderItems = [],
    trackingNumber,
    trackingStatus,
    trackingHistory = [],
  } = receipt;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-zinc-50 to-gray-100 relative overflow-hidden">
      {/* Enhanced Background */}
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,0,128,0.08),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(255,0,128,0.08),transparent_40%)] bg-[length:200%_200%] pointer-events-none"
        style={{ zIndex: 0 }}
      />
      {/* Floating Elements */}
      <div className="absolute top-20 right-20 text-4xl opacity-20 print:hidden">📋</div>
      <div className="absolute bottom-40 left-10 text-3xl opacity-20 print:hidden">📦</div>
      
      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        {/* Header */}
        <div className="mb-8 print:hidden">
          <button
            onClick={() => navigate(`/user/orders/${orderId}`)}
            className="inline-flex items-center px-4 py-2 bg-white/60 backdrop-blur-md text-gray-700 rounded-lg hover:bg-white/80 transition-colors duration-200 shadow-lg border border-zinc-200 font-semibold"
          >
            <ArrowLeft className="w-4 h-4 mr-2 text-red-600" />
            Back to Order Details
          </button>
        </div>

        {/* Main Receipt Card - This is what gets captured for PDF */}
        <div 
          ref={receiptRef}
          className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden print:shadow-none print:rounded-none print:bg-white print:backdrop-blur-none"
        >
          {/* Header Section */}
          <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-8 print:bg-red-600">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-4 flex items-center text-white">
                  <Receipt className="w-8 h-8 mr-3 text-white flex-shrink-0" />
                  Order Receipt
                </h1>
                <div className="space-y-2">
                  <p className="font-mono text-lg text-white">Order ID: {orderIdValue}</p>
                  <p className="flex items-center text-white">
                    <Calendar className="w-4 h-4 mr-2 text-white flex-shrink-0" />
                    {formatDate(orderDate)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-xl text-white mb-3">{cardName}</p>
                <StatusBadge status={paymentStatus} type="header" />
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Order Status & Tracking */}
            <div className="mb-8">
              <div className="bg-red-50/80 backdrop-blur-md rounded-xl p-6 border border-red-100 shadow-lg print:bg-red-50 print:backdrop-blur-none">
                <h3 className="font-semibold text-lg mb-4 flex items-center text-gray-800">
                  <Truck className="w-5 h-5 mr-2 text-red-600 flex-shrink-0" />
                  Tracking Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tracking Number:</span>
                    <span className="font-mono font-medium">{trackingNumber}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status:</span>
                    <StatusBadge status={trackingStatus} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Order Type:</span>
                    <span className="font-medium capitalize">{orderType}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {orderType === 'pickup' && location && (
                <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 border border-red-100 shadow-lg col-span-2 print:bg-white print:backdrop-blur-none">
                  <h3 className="font-semibold text-lg mb-4 flex items-center text-gray-800">
                    <MapPin className="w-5 h-5 mr-2 text-red-600 flex-shrink-0" />
                    Pickup Details
                  </h3>
                  <div className="not-italic text-gray-700 leading-relaxed">
                    <div className="font-medium">{location.address}</div>
                    {location.city && <div>{location.city}</div>}
                    {location.country && <div>{location.country}</div>}
                    {location.postalCode && <div>{location.postalCode}</div>}
                    {location.phone && <div>Phone: {location.phone}</div>}
                    {location.hours && <div>Hours: {location.hours}</div>}
                  </div>
                </div>
              )}

              {orderType === 'delivery' && shippingAddress && billingAddress &&
                shippingAddress.address === billingAddress.address &&
                shippingAddress.city === billingAddress.city &&
                shippingAddress.country === billingAddress.country &&
                shippingAddress.postalCode === billingAddress.postalCode ? (
                <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 border border-red-100 shadow-lg col-span-2 print:bg-white print:backdrop-blur-none">
                  <h3 className="font-semibold text-lg mb-4 flex items-center text-gray-800">
                    <MapPin className="w-5 h-5 mr-2 text-red-600 flex-shrink-0" />
                    Shipping & Billing Address
                  </h3>
                  <address className="not-italic text-gray-700 leading-relaxed">
                    <div className="font-medium">{shippingAddress.address}</div>
                    <div>{shippingAddress.city}, {shippingAddress.country}</div>
                    <div>{shippingAddress.postalCode}</div>
                  </address>
                </div>
              ) : orderType === 'delivery' && (
                <>
                  <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 border border-red-100 shadow-lg print:bg-white print:backdrop-blur-none">
                    <h3 className="font-semibold text-lg mb-4 flex items-center text-gray-800">
                      <MapPin className="w-5 h-5 mr-2 text-red-600 flex-shrink-0" />
                      Shipping Address
                    </h3>
                    {shippingAddress ? (
                      <address className="not-italic text-gray-700 leading-relaxed">
                        <div className="font-medium">{shippingAddress.address}</div>
                        <div>{shippingAddress.city}, {shippingAddress.country}</div>
                        <div>{shippingAddress.postalCode}</div>
                      </address>
                    ) : (
                      <p className="text-gray-400">N/A</p>
                    )}
                  </div>
                  <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 border border-pink-100 shadow-lg print:bg-white print:backdrop-blur-none">
                    <h3 className="font-semibold text-lg mb-4 flex items-center text-gray-800">
                      <CreditCard className="w-5 h-5 mr-2 text-pink-600 flex-shrink-0" />
                      Billing Address
                    </h3>
                    {billingAddress ? (
                      <address className="not-italic text-gray-700 leading-relaxed">
                        <div className="font-medium">{billingAddress.address}</div>
                        <div>{billingAddress.city}, {billingAddress.country}</div>
                        <div>{billingAddress.postalCode}</div>
                      </address>
                    ) : (
                      <p className="text-gray-400">N/A</p>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Order Items */}
            <div className="mb-8">
              <h3 className="font-semibold text-xl mb-6 flex items-center text-gray-800">
                <Package className="w-6 h-6 mr-2 text-red-600 flex-shrink-0" />
                Order Items
              </h3>
              <div className="bg-white/80 backdrop-blur-md rounded-xl border border-gray-200 overflow-hidden shadow-lg print:bg-white print:backdrop-blur-none">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 print:bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 print:bg-white">
                      {orderItems.map((item, idx) => (
                        <tr key={item._id} className="hover:bg-gray-50 transition-colors print:hover:bg-transparent">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {idx + 1}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs">
                            {item.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-12 h-12 object-contain rounded border border-gray-200" 
                              crossOrigin="anonymous"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                const placeholder = document.createElement('div');
                                placeholder.className = 'w-12 h-12 bg-gray-100 flex items-center justify-center text-lg border border-gray-200 rounded';
                                placeholder.textContent = '📦';
                                e.target.parentNode.insertBefore(placeholder, e.target.nextSibling);
                              }}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                            {formatCurrency(item.price, payment?.currency)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
                            {formatCurrency(item.price * item.quantity, payment?.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 print:bg-gray-50">
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-right font-bold text-lg text-gray-900">
                          Total Amount
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-xl text-red-600">
                          {formatCurrency(price, payment?.currency)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            {/* Notes */}
            {notes && (
              <div className="mb-8 bg-amber-50/80 backdrop-blur-md rounded-xl p-6 border border-amber-200 shadow-lg print:bg-amber-50 print:backdrop-blur-none">
                <h3 className="font-semibold text-lg mb-2 text-gray-800">Order Notes</h3>
                <p className="text-gray-700">{notes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-center space-x-4 pt-6 border-t border-gray-200 print:hidden">
              <button
                className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium shadow-sm"
                onClick={handlePrintReceipt}
              >
                <Download className="w-4 h-4 mr-2 flex-shrink-0" />
                Print Receipt
              </button>
              <button
                className="inline-flex items-center px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors duration-200 font-medium shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleDownloadReceipt}
                disabled={downloadLoading}
              >
                <Download className="w-4 h-4 mr-2 flex-shrink-0" />
                {downloadLoading ? 'Generating PDF...' : 'Download PDF'}
              </button>
            </div>
            
            {downloadError && (
              <div className="text-center text-red-600 mt-2 text-sm print:hidden">
                {downloadError}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderReceiptPage;