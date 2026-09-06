import PDFDocument from 'pdfkit';

/**
 * Generates an appointment confirmation receipt PDF in memory.
 * Returns a Promise that resolves to a Buffer.
 */
export const generateAppointmentReceiptPdf = (patientName, appointment) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // Header
      doc.fillColor('#0ea5e9').fontSize(24).text('DentCare Dental Clinic', { align: 'center' });
      doc.moveDown(1);

      doc.fillColor('#475569').fontSize(12).text(`Receipt Date: ${new Date().toLocaleDateString()}`, { align: 'right' });
      doc.text(`Receipt Reference: DENT-${appointment._id.toString().substring(18).toUpperCase()}`, { align: 'right' });
      doc.moveDown(1.5);

      // Section Title
      doc.fillColor('#0f172a').fontSize(16).text('APPOINTMENT BOOKING RECEIPT', { align: 'center', underline: true });
      doc.moveDown(2);

      // Receipt details
      const startX = 100;
      let currentY = doc.y;

      const drawRow = (label, value) => {
        doc.fillColor('#64748b').fontSize(11).text(label, startX, currentY);
        doc.fillColor('#0f172a').fontSize(11).text(value, startX + 150, currentY);
        currentY += 24;
      };

      drawRow('Patient Name:', patientName);
      drawRow('Treatment:', appointment.treatment);
      drawRow('Doctor:', `Dr. ${appointment.dentist?.fullName || 'N/A'}`);
      drawRow('Appointment Date:', new Date(appointment.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }));
      drawRow('Time Slot:', appointment.time);
      drawRow('Status:', appointment.status);
      
      if (appointment.notes) {
        drawRow('Notes:', appointment.notes);
      }

      // Footer notes
      doc.moveDown(4);
      doc.fillColor('#64748b').fontSize(10).text('Please arrive 15 minutes prior to your scheduled time.', { align: 'center' });
      doc.text('For cancellations or rescheduling, please contact us at least 24 hours in advance.', { align: 'center' });
      
      doc.moveDown(2);
      doc.text('Thank you for choosing DentCare Clinic!', { align: 'center', fontStyle: 'italic' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

export const generateBillingReceiptPdf = (patientName, bill) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // Header
      doc.fillColor('#0d9488').fontSize(24).text('DentCare Dental Clinic', { align: 'center' });
      doc.moveDown(1);

      doc.fillColor('#475569').fontSize(12).text(`Billing Date: ${new Date(bill.date || bill.createdAt || new Date()).toLocaleDateString()}`, { align: 'right' });
      doc.text(`Receipt Reference: INV-${bill._id.toString().substring(18).toUpperCase()}`, { align: 'right' });
      doc.moveDown(1.5);

      // Section Title
      doc.fillColor('#0f172a').fontSize(16).text('OFFICIAL PAYMENT RECEIPT', { align: 'center', underline: true });
      doc.moveDown(2);

      // Receipt details
      const startX = 100;
      let currentY = doc.y;

      const drawRow = (label, value) => {
        doc.fillColor('#64748b').fontSize(11).text(label, startX, currentY);
        doc.fillColor('#0f172a').fontSize(11).text(value, startX + 170, currentY);
        currentY += 24;
      };

      drawRow('Patient Name:', patientName);
      
      if (bill.items && bill.items.length > 0) {
        currentY += 10;
        doc.fillColor('#0f172a').fontSize(12).text('Itemized Details:', startX, currentY, { underline: true });
        currentY += 24;

        // Draw headers
        doc.fillColor('#64748b').fontSize(10).text('Service/Treatment', startX, currentY);
        doc.text('Cost', startX + 250, currentY, { align: 'right', width: 100 });
        currentY += 18;

        // Draw divider
        doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(startX, currentY).lineTo(startX + 350, currentY).stroke();
        currentY += 8;

        bill.items.forEach(item => {
          doc.fillColor('#334155').fontSize(10).text(item.name, startX, currentY);
          doc.text(`Rs. ${Number(item.cost).toLocaleString()}`, startX + 250, currentY, { align: 'right', width: 100 });
          currentY += 18;
        });

        currentY += 10;
        // Draw total divider
        doc.strokeColor('#cbd5e1').lineWidth(1.5).moveTo(startX, currentY).lineTo(startX + 350, currentY).stroke();
        currentY += 8;

        doc.fillColor('#0f172a').fontSize(11).text('Total Invoice Amount:', startX, currentY);
        doc.text(`Rs. ${Number(bill.amount).toLocaleString()}`, startX + 250, currentY, { align: 'right', width: 100 });
        currentY += 30;

        drawRow('Payment Method:', bill.paymentMethod || 'N/A');
        drawRow('Payment Status:', bill.status);
      } else {
        drawRow('Treatment / Service:', bill.treatment);
        drawRow('Payment Amount:', `Rs. ${Number(bill.amount).toLocaleString()}`);
        drawRow('Payment Method:', bill.paymentMethod || 'N/A');
        drawRow('Payment Status:', bill.status);
      }

      // Footer notes
      doc.moveDown(4);
      doc.fillColor('#64748b').fontSize(10).text('This is a computer-generated official receipt.', { align: 'center' });
      doc.text('No signature is required. For inquiries, contact billing@dentcare.com.', { align: 'center' });
      
      doc.moveDown(2);
      doc.text('Thank you for your payment!', { align: 'center', fontStyle: 'italic' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Generates an official Prescription PDF in memory.
 * Returns a Promise that resolves to a Buffer.
 */
export const generatePrescriptionPdf = (patientName, prescription) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 45, size: 'A4' });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      const primaryColor = '#0ea5e9';
      const darkColor = '#0f172a';
      const textGray = '#475569';
      const lightGray = '#e2e8f0';

      // Clinic Header
      doc.fillColor(primaryColor).fontSize(22).text('DentCare Dental Clinic', { align: 'center' });
      doc.fillColor(textGray).fontSize(10).text('123 Healthcare Way, Medical District | Tel: +94 11 234 5678 | Email: care@dentcare.com', { align: 'center' });
      doc.moveDown(0.8);

      // Divider
      doc.strokeColor(primaryColor).lineWidth(1.5).moveTo(45, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(1);

      // Rx Header with Reference & Date
      const dateFormatted = new Date(prescription.date || new Date()).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const rxRef = `RX-${prescription._id ? prescription._id.toString().substring(18).toUpperCase() : 'NEW'}`;

      doc.fillColor(darkColor).fontSize(14).text('PRESCRIPTION / MEDICAL ORDERS', 45, doc.y);
      doc.fillColor(textGray).fontSize(10).text(`Date: ${dateFormatted}`, 400, doc.y - 14, { align: 'right' });
      doc.text(`Rx Ref: ${rxRef}`, 400, doc.y + 2, { align: 'right' });
      doc.moveDown(1.5);

      // Patient & Doctor Information Box
      const infoBoxY = doc.y;
      doc.rect(45, infoBoxY, 505, 75).fillAndStroke('#f8fafc', lightGray);

      doc.fillColor(darkColor).fontSize(10).text('PATIENT INFORMATION', 55, infoBoxY + 10);
      doc.fillColor(textGray).fontSize(9).text(`Name: ${patientName}`, 55, infoBoxY + 26);
      if (prescription.patient?.gender) {
        doc.text(`Gender: ${prescription.patient.gender}`, 55, infoBoxY + 40);
      }
      if (prescription.patient?.allergies) {
        doc.fillColor('#dc2626').text(`Allergies: ${prescription.patient.allergies}`, 55, infoBoxY + 54);
      }

      doc.fillColor(darkColor).fontSize(10).text('PRESCRIBING DENTIST', 320, infoBoxY + 10);
      const docName = prescription.dentist?.fullName ? `Dr. ${prescription.dentist.fullName}` : 'Attending Dentist';
      doc.fillColor(textGray).fontSize(9).text(`Doctor: ${docName}`, 320, infoBoxY + 26);
      if (prescription.dentist?.email) {
        doc.text(`Email: ${prescription.dentist.email}`, 320, infoBoxY + 40);
      }
      if (prescription.dentist?.phoneNumber) {
        doc.text(`Tel: ${prescription.dentist.phoneNumber}`, 320, infoBoxY + 54);
      }

      doc.y = infoBoxY + 88;
      doc.moveDown(0.8);

      // Clinical Diagnosis
      doc.fillColor(darkColor).fontSize(11).text('Clinical Diagnosis / Chief Complaint:', 45, doc.y);
      doc.fillColor(primaryColor).fontSize(11).text(prescription.diagnosis || 'Clinical Dental Assessment', 260, doc.y);
      doc.moveDown(1.5);

      // Medications Table Header (Rx symbol)
      const tableStartY = doc.y;
      doc.fillColor(primaryColor).fontSize(16).text('Rx', 45, tableStartY);
      doc.fillColor(darkColor).fontSize(12).text('Prescribed Medications & Schedule', 70, tableStartY + 2);
      doc.moveDown(1);

      // Table Columns: Drug & Dosage (180), Frequency (110), Duration (80), Instructions (135)
      const colX = {
        name: 45,
        freq: 220,
        dur: 330,
        inst: 410
      };

      const headerY = doc.y;
      doc.rect(45, headerY - 4, 505, 20).fill('#e0f2fe');
      doc.fillColor('#0369a1').fontSize(9)
        .text('MEDICATION & DOSAGE', colX.name + 6, headerY + 2)
        .text('FREQUENCY', colX.freq, headerY + 2)
        .text('DURATION', colX.dur, headerY + 2)
        .text('INSTRUCTIONS', colX.inst, headerY + 2);

      let rowY = headerY + 22;

      const medications = prescription.medications || [];
      medications.forEach((med, i) => {
        const isEven = i % 2 === 0;
        if (isEven) {
          doc.rect(45, rowY - 4, 505, 26).fill('#f8fafc');
        }

        doc.fillColor(darkColor).fontSize(9).text(med.name, colX.name + 6, rowY);
        doc.fillColor(textGray).fontSize(8).text(med.dosage, colX.name + 6, rowY + 11);

        doc.fillColor(darkColor).fontSize(9).text(med.frequency, colX.freq, rowY + 4);
        doc.fillColor(darkColor).fontSize(9).text(med.duration, colX.dur, rowY + 4);
        doc.fillColor(textGray).fontSize(8).text(med.instructions || 'As directed', colX.inst, rowY + 4, { width: 130 });

        rowY += 28;
      });

      doc.y = rowY + 12;

      // Clinical Notes / Precautions
      if (prescription.notes) {
        doc.rect(45, doc.y, 505, 45).fillAndStroke('#fffbeb', '#fef3c7');
        doc.fillColor('#b45309').fontSize(9).text('Doctor Advice / Instructions:', 55, doc.y + 8);
        doc.fillColor('#78350f').fontSize(8.5).text(prescription.notes, 55, doc.y + 22, { width: 485 });
        doc.y += 55;
      } else {
        doc.moveDown(1.5);
      }

      // Signature & Stamp Section
      doc.moveDown(2);
      const signY = doc.y > 680 ? 680 : doc.y;
      doc.strokeColor(lightGray).lineWidth(1).moveTo(350, signY + 35).lineTo(530, signY + 35).stroke();
      doc.fillColor(darkColor).fontSize(9).text(docName, 350, signY + 40, { align: 'center', width: 180 });
      doc.fillColor(textGray).fontSize(8).text('Authorized Dental Practitioner', 350, signY + 52, { align: 'center', width: 180 });

      // Footer
      doc.fillColor(textGray).fontSize(8).text('Please present this prescription to an authorized pharmacy. Follow prescribed dosage schedules accurately.', 45, 780, { align: 'center', width: 505 });
      doc.text('This digital document was generated by DentCare Dental Management System.', 45, 792, { align: 'center', width: 505 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
