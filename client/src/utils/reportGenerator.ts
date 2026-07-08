import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportStats {
  todaySales: number;
  totalSales: number;
  totalOrders: number;
  todayOrders: number;
  totalCustomers: number;
  activeProducts: number;
  topProducts: { name: string; price: number; sales: number }[];
}

export const generatePDFReport = (stats: ReportStats) => {
  const doc = new jsPDF();
  
  // Set fonts and colors
  const primaryColor: [number, number, number] = [212, 175, 55]; // Luxury Gold #D4AF37
  const textColor: [number, number, number] = [51, 51, 51];
  
  // ================= Header =================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(...primaryColor);
  doc.text('GENZ ROYAL HAMPERS', 14, 25);
  
  doc.setFontSize(10);
  doc.setTextColor(...textColor);
  doc.setFont('helvetica', 'normal');
  doc.text('Luxury Gifting & Celebrations', 14, 32);
  doc.text('Official Business Report', 14, 37);
  
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.text(`Date Generated: ${currentDate}`, 140, 25);
  
  // Divider
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(14, 42, 196, 42);

  // ================= CEO Message =================
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.text('"Striving for excellence in every hamper we deliver. Let the data guide our growth."', 14, 52);
  
  doc.setFont('helvetica', 'bold');
  doc.text('- Vishal, CEO', 14, 58);
  
  // ================= Analytics Overview =================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...primaryColor);
  doc.text('Executive Analytics Overview', 14, 75);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  doc.setFontSize(12);
  doc.setTextColor(...textColor);
  doc.setFont('helvetica', 'normal');
  
  doc.text(`Today's Revenue:`, 14, 85);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(stats.todaySales), 60, 85);
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Lifetime Revenue:`, 105, 85);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(stats.totalSales), 160, 85);

  doc.setFont('helvetica', 'normal');
  doc.text(`Today's Orders:`, 14, 95);
  doc.setFont('helvetica', 'bold');
  doc.text(stats.todayOrders.toString(), 60, 95);

  doc.setFont('helvetica', 'normal');
  doc.text(`Total Lifetime Orders:`, 105, 95);
  doc.setFont('helvetica', 'bold');
  doc.text(stats.totalOrders.toString(), 160, 95);

  doc.setFont('helvetica', 'normal');
  doc.text(`Total Active Customers:`, 14, 105);
  doc.setFont('helvetica', 'bold');
  doc.text(stats.totalCustomers.toString(), 60, 105);

  doc.setFont('helvetica', 'normal');
  doc.text(`Total Active Products:`, 105, 105);
  doc.setFont('helvetica', 'bold');
  doc.text(stats.activeProducts.toString(), 160, 105);

  // ================= Top Products Table =================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...primaryColor);
  doc.text('Top Selling Products', 14, 125);

  const tableBody = stats.topProducts.map((p, index) => [
    index + 1,
    p.name,
    formatCurrency(p.price),
    p.sales.toString()
  ]);

  autoTable(doc, {
    startY: 130,
    head: [['Rank', 'Product Name', 'Price', 'Total Sales Volume']],
    body: tableBody,
    theme: 'grid',
    headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' },
    styles: { font: 'helvetica', fontSize: 10, cellPadding: 5 },
    alternateRowStyles: { fillColor: [250, 250, 250] },
  });

  // ================= Footer Instructions =================
  const pageHeight = doc.internal.pageSize.height;
  
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(14, pageHeight - 30, 196, pageHeight - 30);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(200, 50, 50); // Red for emphasis
  doc.text('CONFIDENTIAL: FOR INTERNAL MANAGEMENT USE ONLY', 14, pageHeight - 20);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('Instructions: This document contains sensitive financial data and customer analytics. Do not distribute outside of authorized company channels. All figures are subject to final audit verification.', 14, pageHeight - 14, { maxWidth: 182 });
  
  // Download the PDF
  doc.save(`GENZ_Official_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};
