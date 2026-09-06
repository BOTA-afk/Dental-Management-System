import nodemailer from 'nodemailer';

/**
 * Sends a 6-digit OTP code to the patient's email.
 * Falls back to logging to server console if no SMTP credentials are provided.
 */
export const sendOtpEmail = async (email, otp) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const emailService = process.env.EMAIL_SERVICE || 'gmail';

  if (!emailUser || !emailPass) {
    console.log('\n=========================================');
    console.log(`🔑 [DEVELOPMENT OTP] Code for patient ${email}:`);
    console.log(`👉 OTP: ${otp} 👈`);
    console.log(`Validity: Expires in 10 minutes`);
    console.log('=========================================\n');
    return { success: true, message: 'OTP logged to server console (development mode).' };
  }

  try {
    // Strip all standard and non-breaking spaces (NBSP) from the password
    const cleanPass = emailPass.replace(/[\s\u00a0]/g, '');

    let transportConfig = {
      auth: {
        user: emailUser,
        pass: cleanPass,
      },
    };

    if (process.env.EMAIL_HOST && process.env.EMAIL_HOST.toLowerCase().includes('gmail')) {
      // Use built-in Gmail service configuration for best reliability
      transportConfig.service = 'gmail';
    } else {
      // Use custom SMTP server config (e.g., Mailtrap)
      transportConfig.host = process.env.EMAIL_HOST;
      transportConfig.port = parseInt(process.env.EMAIL_PORT || '587');
      transportConfig.secure = process.env.EMAIL_PORT === '465';
      transportConfig.tls = {
        rejectUnauthorized: false,
      };
    }

    const transporter = nodemailer.createTransport(transportConfig);

    const mailOptions = {
      from: `"DentCare Clinic" <${emailUser}>`,
      to: email,
      subject: 'DentCare - Password Reset Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #10a5dc; text-align: center;">DentCare Clinic</h2>
          <p>Hello,</p>
          <p>We received a request to reset your password. Use the following verification code to proceed with resetting your password. This code is valid for 10 minutes:</p>
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0f172a;">${otp}</span>
          </div>
          <p>If you did not request this, you can safely ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 30px;"/>
          <p style="font-size: 12px; color: #64748b; text-align: center;">This is an automated message from DentCare Dental Clinic.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Email sent to ${email}: ${info.messageId}`);
    return { success: true, message: 'OTP sent to email.' };
  } catch (error) {
    console.error('❌ Error sending reset OTP email:', error);
    // Log fallback in case SMTP fails during presentation
    console.log('\n=========================================');
    console.log(`🔑 [FALLBACK OTP] Code for patient ${email}:`);
    console.log(`👉 OTP: ${otp} 👈`);
    console.log('Validity: Expires in 10 minutes (SMTP failed, using console fallback)');
    console.log('=========================================\n');
    return { success: true, message: 'OTP logged to server console (SMTP failed).' };
  }
};

export const sendAppointmentConfirmationEmail = async (email, patientName, appointment, pdfBuffer) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    console.log('\n=========================================');
    doc_logging:
    console.log(`✉️ [DEVELOPMENT EMAIL] Appointment Confirmation for ${patientName} (${email}):`);
    console.log(`Doctor: Dr. ${appointment.dentist?.fullName || 'N/A'}`);
    console.log(`Treatment: ${appointment.treatment}`);
    console.log(`Date/Time: ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time}`);
    console.log(`PDF Attachment: Simulated (Buffer size: ${pdfBuffer.length} bytes)`);
    console.log('=========================================\n');
    return { success: true, message: 'Email logged to server console (development mode).' };
  }

  try {
    const cleanPass = emailPass.replace(/[\s\u00a0]/g, '');

    let transportConfig = {
      auth: {
        user: emailUser,
        pass: cleanPass,
      },
    };

    if (process.env.EMAIL_HOST && process.env.EMAIL_HOST.toLowerCase().includes('gmail')) {
      transportConfig.service = 'gmail';
    } else {
      transportConfig.host = process.env.EMAIL_HOST;
      transportConfig.port = parseInt(process.env.EMAIL_PORT || '587');
      transportConfig.secure = process.env.EMAIL_PORT === '465';
      transportConfig.tls = {
        rejectUnauthorized: false,
      };
    }

    const transporter = nodemailer.createTransport(transportConfig);

    const formattedDate = new Date(appointment.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const recipients = [email, emailUser].filter(Boolean).join(', ');

    const mailOptions = {
      from: `"DentCare Clinic" <${emailUser}>`,
      to: recipients,
      subject: 'DentCare Clinic - Appointment Booking Confirmation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #0ea5e9; text-align: center;">Appointment Confirmed!</h2>
          <p>Dear ${patientName},</p>
          <p>Thank you for scheduling your appointment with DentCare Dental Clinic. We have successfully received your booking. Here are the details:</p>
          
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: bold; width: 130px;">Treatment:</td>
                <td style="padding: 6px 0; color: #0f172a;">${appointment.treatment}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Dentist:</td>
                <td style="padding: 6px 0; color: #0f172a;">Dr. ${appointment.dentist?.fullName || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Date:</td>
                <td style="padding: 6px 0; color: #0f172a;">${formattedDate}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Time Slot:</td>
                <td style="padding: 6px 0; color: #0f172a;">${appointment.time}</td>
              </tr>
            </table>
          </div>

          <p>Please find attached your appointment booking receipt PDF for your records.</p>
          <p>If you need to reschedule or cancel your appointment, please contact us at least 24 hours prior to your slot.</p>
          
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 30px;"/>
          <p style="font-size: 12px; color: #64748b; text-align: center;">This is an automated message from DentCare Dental Clinic.</p>
        </div>
      `,
      attachments: [
        {
          filename: `Appointment-Receipt-${appointment._id.toString().substring(18).toUpperCase()}.pdf`,
          content: pdfBuffer
        }
      ]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Confirmation email sent to ${recipients}: ${info.messageId}`);
    return { success: true, message: 'Confirmation email sent.' };
  } catch (error) {
    console.error('❌ Error sending confirmation email:', error);
    console.log('\n=========================================');
    console.log(`✉️ [FALLBACK EMAIL] Appointment Confirmation for ${patientName} (${email}):`);
    console.log(`Doctor: Dr. ${appointment.dentist?.fullName || 'N/A'}`);
    console.log(`Treatment: ${appointment.treatment}`);
    console.log(`Date/Time: ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time}`);
    console.log('=========================================\n');
    throw new Error('Failed to send confirmation email. Details: ' + error.message);
  }
};

export const sendPatientWelcomeEmail = async (email, patientName, tempPassword) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    console.log('\n=========================================');
    console.log(`✉️ [DEVELOPMENT WELCOME EMAIL] Welcome to DentCare, ${patientName} (${email}):`);
    console.log(`Your temporary credentials:`);
    console.log(`Username: ${email}`);
    console.log(`Temporary Password: ${tempPassword}`);
    console.log('=========================================\n');
    return { success: true, message: 'Email logged to server console (development mode).' };
  }

  try {
    const cleanPass = emailPass.replace(/[\s\u00a0]/g, '');

    let transportConfig = {
      auth: {
        user: emailUser,
        pass: cleanPass,
      },
    };

    if (process.env.EMAIL_HOST && process.env.EMAIL_HOST.toLowerCase().includes('gmail')) {
      transportConfig.service = 'gmail';
    } else {
      transportConfig.host = process.env.EMAIL_HOST;
      transportConfig.port = parseInt(process.env.EMAIL_PORT || '587');
      transportConfig.secure = process.env.EMAIL_PORT === '465';
      transportConfig.tls = {
        rejectUnauthorized: false,
      };
    }

    const transporter = nodemailer.createTransport(transportConfig);

    const recipients = [email, emailUser].filter(Boolean).join(', ');

    const mailOptions = {
      from: `"DentCare Clinic" <${emailUser}>`,
      to: recipients,
      subject: 'Welcome to DentCare Clinic - Your Account Credentials',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #0ea5e9; text-align: center;">Welcome to DentCare!</h2>
          <p>Dear ${patientName},</p>
          <p>Your patient record has been successfully registered at DentCare Dental Clinic by the administrator.</p>
          <p>You can now log in to the DentCare Patient web portal and mobile app using the following temporary credentials:</p>
          
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: bold; width: 130px;">Email / User:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: bold;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Temporary Password:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: bold; font-family: monospace; font-size: 16px;">${tempPassword}</td>
              </tr>
            </table>
          </div>

          <p style="color: #ef4444; font-weight: bold;">Important: Please reset your password after your first login to secure your account.</p>
          
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 30px;"/>
          <p style="font-size: 12px; color: #64748b; text-align: center;">This is an automated message from DentCare Dental Clinic.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Patient welcome email sent to ${recipients}: ${info.messageId}`);
    return { success: true, message: 'Welcome email sent.' };
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    console.log('\n=========================================');
    console.log(`✉️ [FALLBACK WELCOME] Credentials for ${patientName} (${email}):`);
    console.log(`Temporary Password: ${tempPassword}`);
    console.log('=========================================\n');
    throw new Error('Failed to send welcome email. Details: ' + error.message);
  }
};

export const sendBillingReceiptEmail = async (email, patientName, bill, pdfBuffer) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    console.log('\n=========================================');
    console.log(`✉️ [DEVELOPMENT EMAIL] Billing Receipt Email for ${patientName} (${email}):`);
    console.log(`Treatment: ${bill.treatment}`);
    console.log(`Amount: Rs. ${bill.amount.toLocaleString()} via ${bill.paymentMethod || 'N/A'}`);
    console.log(`PDF Attachment: Simulated (Buffer size: ${pdfBuffer.length} bytes)`);
    console.log('=========================================\n');
    return { success: true, message: 'Receipt email logged to server console (development mode).' };
  }

  try {
    const cleanPass = emailPass.replace(/[\s\u00a0]/g, '');

    let transportConfig = {
      auth: {
        user: emailUser,
        pass: cleanPass,
      },
    };

    if (process.env.EMAIL_HOST && process.env.EMAIL_HOST.toLowerCase().includes('gmail')) {
      transportConfig.service = 'gmail';
    } else {
      transportConfig.host = process.env.EMAIL_HOST;
      transportConfig.port = parseInt(process.env.EMAIL_PORT || '587');
      transportConfig.secure = process.env.EMAIL_PORT === '465';
      transportConfig.tls = {
        rejectUnauthorized: false,
      };
    }

    const transporter = nodemailer.createTransport(transportConfig);

    const formattedDate = new Date(bill.date || new Date()).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const mailOptions = {
      from: `"DentCare Clinic" <${emailUser}>`,
      to: email,
      subject: `DentCare Clinic - Payment Receipt: INV-${bill._id.toString().substring(18).toUpperCase()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #0d9488; text-align: center;">Payment Receipt Confirmation</h2>
          <p>Dear ${patientName},</p>
          <p>Thank you for your payment. We have successfully processed your payment transaction. Here are the invoice receipt details:</p>
          
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: bold; width: 140px;">Invoice Reference:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: bold;">INV-${bill._id.toString().substring(18).toUpperCase()}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Treatment:</td>
                <td style="padding: 6px 0; color: #0f172a;">${bill.treatment}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Amount Paid:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: bold;">Rs. ${Number(bill.amount).toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Payment Method:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: bold; text-transform: uppercase;">${bill.paymentMethod || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Date Paid:</td>
                <td style="padding: 6px 0; color: #0f172a;">${formattedDate}</td>
              </tr>
            </table>
          </div>

          <p>Please find attached the official PDF invoice/receipt for your records.</p>
          <p>If you have any questions or require support regarding this billing summary, please reach out to us at billing@dentcare.com.</p>
          
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 30px;"/>
          <p style="font-size: 12px; color: #64748b; text-align: center;">Thank you for choosing DentCare Dental Clinic.</p>
        </div>
      `,
      attachments: [
        {
          filename: `Invoice-Receipt-INV-${bill._id.toString().substring(18).toUpperCase()}.pdf`,
          content: pdfBuffer
        }
      ]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Billing receipt email sent to ${email}: ${info.messageId}`);
    return { success: true, message: 'Billing receipt email sent.' };
  } catch (error) {
    console.error('❌ Error sending billing receipt email:', error);
    throw new Error('Failed to send billing receipt email. Details: ' + error.message);
  }
};

export const sendTempPasswordEmail = async (email, name, tempPassword) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    console.log('\n=========================================');
    console.log(`✉️ [DEVELOPMENT PASSWORD RESET] Temporary Credentials for ${name} (${email}):`);
    console.log(`Username/Email: ${email}`);
    console.log(`Temporary Password: ${tempPassword}`);
    console.log('=========================================\n');
    return { success: true, message: 'Temp password logged to server console (development mode).' };
  }

  try {
    const cleanPass = emailPass.replace(/[\s\u00a0]/g, '');
    let transportConfig = {
      auth: {
        user: emailUser,
        pass: cleanPass,
      },
    };

    if (process.env.EMAIL_HOST && process.env.EMAIL_HOST.toLowerCase().includes('gmail')) {
      transportConfig.service = 'gmail';
    } else {
      transportConfig.host = process.env.EMAIL_HOST;
      transportConfig.port = parseInt(process.env.EMAIL_PORT || '587');
      transportConfig.secure = process.env.EMAIL_PORT === '465';
      transportConfig.tls = {
        rejectUnauthorized: false,
      };
    }

    const transporter = nodemailer.createTransport(transportConfig);

    const mailOptions = {
      from: `"DentCare Clinic" <${emailUser}>`,
      to: email,
      subject: 'DentCare Staff - Temporary Password Reset',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #0ea5e9; text-align: center;">Temporary Password Issued</h2>
          <p>Dear ${name},</p>
          <p>A temporary password has been generated for your staff account. You can log in using your email and the password below:</p>
          
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: bold; width: 130px;">Login Email:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: bold;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Temporary Password:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: bold; font-family: monospace; font-size: 16px;">${tempPassword}</td>
              </tr>
            </table>
          </div>

          <p style="color: #ef4444; font-weight: bold;">Important: Please reset your password immediately after logging in.</p>
          
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 30px;"/>
          <p style="font-size: 12px; color: #64748b; text-align: center;">This is an automated message from DentCare Dental Clinic.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Temporary password email sent to ${email}: ${info.messageId}`);
    return { success: true, message: 'Temp password email sent.' };
  } catch (error) {
    console.error('❌ Error sending temp password email:', error);
    console.log('\n=========================================');
    console.log(`🔑 [FALLBACK PASSWORD RESET] Credentials for ${name} (${email}):`);
    console.log(`Username/Email: ${email}`);
    console.log(`Temporary Password: ${tempPassword}`);
    console.log('=========================================\n');
    return { success: true, message: 'Temp password logged to server console (SMTP failed).' };
  }
};

/**
 * Sends a formal procurement purchase order to a supplier requesting item delivery within 5 days.
 */
export const sendSupplierOrderEmail = async ({
  supplierEmail,
  supplierName,
  itemName,
  quantity,
  unit,
  orderDate = new Date(),
  expectedDeliveryDate,
  notes = '',
  requestedByName = 'Clinic Inventory Staff'
}) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  const formattedOrderDate = new Date(orderDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formattedDeadlineDate = new Date(expectedDeliveryDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  if (!emailUser || !emailPass) {
    console.log('\n=========================================');
    console.log(`📦 [DEVELOPMENT SUPPLIER ORDER EMAIL]`);
    console.log(`To Supplier: ${supplierName} <${supplierEmail}>`);
    console.log(`Requested Item: ${quantity} ${unit} of ${itemName}`);
    console.log(`Order Date: ${formattedOrderDate}`);
    console.log(`⚠️ REQUIRED DELIVERY: WITHIN 5 DAYS (by ${formattedDeadlineDate})`);
    console.log(`Notes: ${notes || 'Standard restocking replenishment'}`);
    console.log('=========================================\n');
    return { success: true, message: 'Supplier order logged to server console (development mode).' };
  }

  try {
    const cleanPass = emailPass.replace(/[\s\u00a0]/g, '');

    let transportConfig = {
      auth: {
        user: emailUser,
        pass: cleanPass,
      },
    };

    if (process.env.EMAIL_HOST && process.env.EMAIL_HOST.toLowerCase().includes('gmail')) {
      transportConfig.service = 'gmail';
    } else {
      transportConfig.host = process.env.EMAIL_HOST;
      transportConfig.port = parseInt(process.env.EMAIL_PORT || '587');
      transportConfig.secure = process.env.EMAIL_PORT === '465';
      transportConfig.tls = {
        rejectUnauthorized: false,
      };
    }

    const transporter = nodemailer.createTransport(transportConfig);

    const mailOptions = {
      from: `"DentCare Clinic Procurement" <${emailUser}>`,
      to: supplierEmail,
      subject: `DentCare Clinic Supply Order: ${itemName} - Delivery Required Within 5 Days`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; border-bottom: 2px solid #0ea5e9; padding-bottom: 16px; margin-bottom: 20px;">
            <h2 style="color: #0ea5e9; margin: 0; font-size: 24px;">DentCare Dental Clinic</h2>
            <p style="color: #64748b; margin: 4px 0 0 0; font-size: 14px;">Clinical Supplies & Store Management Department</p>
          </div>

          <p style="font-size: 15px; color: #1e293b;">Dear <strong>${supplierName}</strong>,</p>
          
          <p style="font-size: 14px; color: #334155; line-height: 1.6;">
            We have generated a formal supply procurement order for our clinical stock. 
            Because this item is critical for ongoing patient treatments, 
            <strong style="color: #dc2626;">delivery is requested within 5 business days (by ${formattedDeadlineDate})</strong>.
          </p>

          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 20px 0;">
            <h3 style="color: #0f172a; margin-top: 0; margin-bottom: 12px; font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Order Details</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 6px 0; color: #64748b; width: 160px; font-weight: bold;">Item Name:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: bold;">${itemName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Quantity Requested:</td>
                <td style="padding: 6px 0; color: #0284c7; font-weight: bold; font-size: 16px;">${quantity} ${unit}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Order Date:</td>
                <td style="padding: 6px 0; color: #0f172a;">${formattedOrderDate}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Required Delivery:</td>
                <td style="padding: 6px 0; color: #dc2626; font-weight: bold;">Within 5 Days (on or before ${formattedDeadlineDate})</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Requested By:</td>
                <td style="padding: 6px 0; color: #0f172a;">${requestedByName}</td>
              </tr>
              ${notes ? `
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: bold; vertical-align: top;">Instructions / Notes:</td>
                <td style="padding: 6px 0; color: #334155; font-style: italic;">${notes}</td>
              </tr>` : ''}
            </table>
          </div>

          <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; margin-bottom: 20px; border-radius: 4px;">
            <p style="margin: 0; font-size: 13px; color: #991b1b;">
              <strong>Delivery Timeline Notice:</strong> Please confirm receipt of this order and reply to this email if there is any delay preventing delivery within the 5-day window.
            </p>
          </div>

          <div style="font-size: 13px; color: #64748b; line-height: 1.5;">
            <p style="margin: 0;"><strong>Delivery Destination:</strong> DentCare Dental Clinic, 123 Healthcare Way, Medical District.</p>
            <p style="margin: 4px 0 0 0;">For delivery coordination or inquiries, contact clinic staff at <strong>+94 11 234 5678</strong>.</p>
          </div>

          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 24px; margin-bottom: 16px;"/>
          <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
            This is an automated procurement order notification issued by DentCare Dental Management System.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Supplier order email sent to ${supplierEmail}: ${info.messageId}`);
    return { success: true, message: 'Supplier order email sent successfully.' };
  } catch (error) {
    console.error('❌ Error sending supplier order email:', error);
    console.log('\n=========================================');
    console.log(`📦 [FALLBACK SUPPLIER ORDER EMAIL LOG] (SMTP issue)`);
    console.log(`Supplier: ${supplierName} <${supplierEmail}>`);
    console.log(`Item: ${quantity} ${unit} of ${itemName}`);
    console.log(`Required Delivery: Within 5 days (by ${formattedDeadlineDate})`);
    console.log('=========================================\n');
    return { success: true, message: 'Supplier order logged to console (SMTP fallback).' };
  }
};

/**
 * Sends an official digital prescription email with attached PDF to the patient.
 */
export const sendPrescriptionEmail = async (email, patientName, prescription, pdfBuffer) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  const docName = prescription.dentist?.fullName ? `Dr. ${prescription.dentist.fullName}` : 'Attending Dentist';
  const rxRef = `RX-${prescription._id ? prescription._id.toString().substring(18).toUpperCase() : 'NEW'}`;
  const formattedDate = new Date(prescription.date || new Date()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  if (!emailUser || !emailPass) {
    console.log('\n=========================================');
    console.log(`💊 [DEVELOPMENT PRESCRIPTION EMAIL]`);
    console.log(`To Patient: ${patientName} <${email}>`);
    console.log(`Prescribing Doctor: ${docName}`);
    console.log(`Diagnosis: ${prescription.diagnosis}`);
    console.log(`Prescription Ref: ${rxRef}`);
    console.log(`Medications (${prescription.medications?.length || 0}):`);
    (prescription.medications || []).forEach((m, idx) => {
      console.log(`   ${idx + 1}. ${m.name} (${m.dosage}) - ${m.frequency} for ${m.duration} [${m.instructions || 'As directed'}]`);
    });
    if (prescription.notes) {
      console.log(`Doctor Advice: ${prescription.notes}`);
    }
    console.log(`PDF Attachment: Simulated (Buffer size: ${pdfBuffer?.length || 0} bytes)`);
    console.log('=========================================\n');
    return { success: true, message: 'Prescription email logged to server console (development mode).' };
  }

  try {
    const cleanPass = emailPass.replace(/[\s\u00a0]/g, '');

    let transportConfig = {
      auth: {
        user: emailUser,
        pass: cleanPass,
      },
    };

    if (process.env.EMAIL_HOST && process.env.EMAIL_HOST.toLowerCase().includes('gmail')) {
      transportConfig.service = 'gmail';
    } else {
      transportConfig.host = process.env.EMAIL_HOST;
      transportConfig.port = parseInt(process.env.EMAIL_PORT || '587');
      transportConfig.secure = process.env.EMAIL_PORT === '465';
      transportConfig.tls = {
        rejectUnauthorized: false,
      };
    }

    const transporter = nodemailer.createTransport(transportConfig);

    const medicationRowsHtml = (prescription.medications || []).map((med, index) => `
      <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f8fafc'}; border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 12px;">
          <strong style="color: #0f172a; font-size: 14px;">${med.name}</strong>
          <div style="color: #64748b; font-size: 12px; margin-top: 2px;">${med.dosage}</div>
        </td>
        <td style="padding: 10px 12px; color: #0284c7; font-weight: 600; font-size: 13px;">${med.frequency}</td>
        <td style="padding: 10px 12px; color: #475569; font-size: 13px;">${med.duration}</td>
        <td style="padding: 10px 12px; color: #475569; font-size: 12px; font-style: italic;">${med.instructions || 'As directed'}</td>
      </tr>
    `).join('');

    const mailOptions = {
      from: `"DentCare Dental Clinic" <${emailUser}>`,
      to: email,
      subject: `DentCare Clinic - Your Prescription from ${docName} (${rxRef})`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
          <!-- Header -->
          <div style="text-align: center; border-bottom: 2px solid #0ea5e9; padding-bottom: 16px; margin-bottom: 20px;">
            <h2 style="color: #0ea5e9; margin: 0; font-size: 24px; font-weight: 700;">DentCare Dental Clinic</h2>
            <p style="color: #64748b; margin: 4px 0 0 0; font-size: 13px;">Official Digital Prescription & Medical Orders</p>
          </div>

          <p style="font-size: 15px; margin-bottom: 12px;">Dear <strong>${patientName}</strong>,</p>
          <p style="font-size: 14px; color: #475569; line-height: 1.5; margin-bottom: 20px;">
            <strong>${docName}</strong> has issued a digital prescription for your dental care. Please find the medication instructions detailed below and in the attached official PDF document.
          </p>

          <!-- Overview Card -->
          <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="padding: 4px 0; color: #0369a1; font-weight: 600; width: 140px;">Prescription Ref:</td>
                <td style="padding: 4px 0; color: #0f172a; font-weight: 700;">${rxRef}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #0369a1; font-weight: 600;">Diagnosis:</td>
                <td style="padding: 4px 0; color: #0f172a; font-weight: 600;">${prescription.diagnosis}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #0369a1; font-weight: 600;">Prescribing Doctor:</td>
                <td style="padding: 4px 0; color: #0f172a;">${docName}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #0369a1; font-weight: 600;">Date Issued:</td>
                <td style="padding: 4px 0; color: #0f172a;">${formattedDate}</td>
              </tr>
            </table>
          </div>

          <!-- Medications List -->
          <h3 style="color: #0f172a; font-size: 15px; margin-bottom: 10px; display: flex; align-items: center;">
            ℞ Prescribed Medications & Dosage Schedule
          </h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
            <thead>
              <tr style="background-color: #f1f5f9; text-align: left; font-size: 12px; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">
                <th style="padding: 8px 12px;">Medication & Dosage</th>
                <th style="padding: 8px 12px;">Frequency</th>
                <th style="padding: 8px 12px;">Duration</th>
                <th style="padding: 8px 12px;">Instructions</th>
              </tr>
            </thead>
            <tbody>
              ${medicationRowsHtml}
            </tbody>
          </table>

          ${prescription.notes ? `
          <!-- Doctor Notes -->
          <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; margin-bottom: 20px; border-radius: 4px;">
            <p style="margin: 0; font-size: 13px; color: #92400e; font-weight: 600;">Doctor's Advice / Precautions:</p>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #78350f;">${prescription.notes}</p>
          </div>` : ''}

          <!-- PDF Attachment Notice -->
          <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; text-align: center;">
            <p style="margin: 0; font-size: 13px; color: #475569;">
              📎 <strong>Official PDF Attached:</strong> You can download or print the attached <span style="font-family: monospace;">${rxRef}.pdf</span> to present at your local pharmacy.
            </p>
          </div>

          <!-- Portal & App Notice -->
          <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 20px;">
            You can also view this prescription and your active medication reminders at any time by logging into the <strong>DentCare Patient Portal</strong> or opening the <strong>DentCare Mobile App</strong>.
          </p>

          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 24px; margin-bottom: 16px;"/>
          <div style="font-size: 12px; color: #94a3b8; text-align: center;">
            <p style="margin: 0;">DentCare Dental Clinic | 123 Healthcare Way, Medical District | +94 11 234 5678</p>
            <p style="margin: 4px 0 0 0;">This is an automated clinical notification. Please do not reply directly to this email.</p>
          </div>
        </div>
      `,
      attachments: pdfBuffer ? [
        {
          filename: `Prescription-${rxRef}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ] : []
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Prescription email sent to ${email}: ${info.messageId}`);
    return { success: true, message: 'Prescription email sent successfully.' };
  } catch (error) {
    console.error('❌ Error sending prescription email:', error);
    console.log('\n=========================================');
    console.log(`💊 [FALLBACK PRESCRIPTION EMAIL LOG] (SMTP issue)`);
    console.log(`Patient: ${patientName} <${email}>`);
    console.log(`Diagnosis: ${prescription.diagnosis}`);
    console.log(`Ref: ${rxRef}`);
    console.log('=========================================\n');
    return { success: false, message: error.message };
  }
};


