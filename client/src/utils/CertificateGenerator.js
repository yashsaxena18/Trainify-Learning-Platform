// src/utils/CertificateGenerator.js - UPDATED VERSION WITH ENHANCED SIGNATURE
import { toast } from 'react-hot-toast';

export const generateCertificatePDF = async (course, user) => {
  try {
    toast.loading("Generating your certificate...", { id: 'cert-gen' });

    // Dynamic import for libraries
    const [html2canvas, { default: jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf')
    ]);

    // Create a more robust temporary certificate element
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'fixed';
    tempContainer.style.top = '-9999px';
    tempContainer.style.left = '-9999px';
    tempContainer.style.zIndex = '-1';
    tempContainer.style.visibility = 'hidden';
    tempContainer.style.pointerEvents = 'none';

    const certificateHTML = `
      <div id="certificate-content" style="
        width: 1200px; 
        height: 900px; 
        background: linear-gradient(135deg, #eff6ff 0%, #e0e7ff 50%, #f3e8ff 100%);
        padding: 40px;
        font-family: 'Arial', 'Helvetica', sans-serif;
        position: relative;
        box-sizing: border-box;
        display: block;
      ">
        <!-- Decorative Border -->
        <div style="
          position: absolute;
          top: 15px; left: 15px; right: 15px; bottom: 15px;
          border: 8px solid #f59e0b;
          border-radius: 20px;
        "></div>
        <div style="
          position: absolute;
          top: 30px; left: 30px; right: 30px; bottom: 30px;
          border: 4px solid #d97706;
          border-radius: 15px;
        "></div>

        <!-- Decorative Stars -->
        <div style="position: absolute; top: 50px; left: 50px; font-size: 24px; opacity: 0.3;">⭐</div>
        <div style="position: absolute; top: 50px; right: 50px; font-size: 24px; opacity: 0.3;">⭐</div>
        <div style="position: absolute; bottom: 50px; left: 50px; font-size: 24px; opacity: 0.3;">⭐</div>
        <div style="position: absolute; bottom: 50px; right: 50px; font-size: 24px; opacity: 0.3;">⭐</div>

        <!-- Content Container -->
        <div style="
          position: relative; 
          z-index: 10; 
          height: 100%; 
          display: flex; 
          flex-direction: column; 
          justify-content: space-between;
          padding: 40px 0;
        ">
          
          <!-- Header Section -->
          <div style="text-align: center;">
            <div style="font-size: 50px; margin-bottom: 15px;">🏆</div>
            <h1 style="
              font-size: 42px; 
              font-weight: 900; 
              color: #1f2937; 
              margin: 0 0 10px 0;
              letter-spacing: 2px;
            ">CERTIFICATE OF COMPLETION</h1>
            <div style="
              width: 200px; 
              height: 4px; 
              background: linear-gradient(to right, #f59e0b, #eab308); 
              margin: 0 auto;
            "></div>
          </div>

          <!-- Main Content Section -->
          <div style="text-align: center; flex-grow: 1; display: flex; flex-direction: column; justify-content: center;">
            <p style="font-size: 20px; color: #6b7280; margin-bottom: 20px;">
              This is to certify that
            </p>
            <h2 style="
              font-size: 48px; 
              font-weight: 900; 
              color: #2563eb;
              margin: 0 0 20px 0;
              line-height: 1.1;
            ">${user?.name || "Student Name"}</h2>
            <p style="font-size: 20px; color: #6b7280; margin-bottom: 15px;">
              has successfully completed the course
            </p>
            <h3 style="
              font-size: 28px; 
              font-weight: bold; 
              color: #1f2937; 
              margin: 0 0 30px 0;
              padding: 0 40px;
              line-height: 1.3;
            ">"${course.title}"</h3>

            <!-- Stats Section -->
            <div style="
              display: flex; 
              justify-content: center; 
              gap: 80px;
              margin-bottom: 30px;
            ">
              <div style="text-align: center;">
                <div style="font-size: 28px; font-weight: bold; color: #2563eb;">100%</div>
                <div style="color: #6b7280; font-size: 16px; font-weight: 500;">Completion Rate</div>
              </div>
              <div style="text-align: center;">
                <div style="font-size: 28px; font-weight: bold; color: #7c3aed;">
                  ${course.lectures?.length || "3"}
                </div>
                <div style="color: #6b7280; font-size: 16px; font-weight: 500;">Lectures Completed</div>
              </div>
              <div style="text-align: center;">
                <div style="font-size: 28px; font-weight: bold; color: #059669;">A+</div>
                <div style="color: #6b7280; font-size: 16px; font-weight: 500;">Grade Achieved</div>
              </div>
            </div>
          </div>

          <!-- Footer Section -->
          <div style="
            display: flex; 
            justify-content: space-between; 
            align-items: flex-end;
            margin-top: 40px;
          ">
            <!-- Date -->
            <div style="text-align: center; flex: 1;">
              <div style="
                width: 220px; 
                border-bottom: 3px solid #6b7280; 
                margin: 0 auto 15px auto;
              "></div>
              <p style="color: #1f2937; font-weight: bold; margin: 0 0 8px 0; font-size: 20px;">
                ${new Date().toLocaleDateString("en-GB")}
              </p>
              <p style="color: #6b7280; font-weight: 600; margin: 0; font-size: 16px;">Date of Completion</p>
            </div>

            <!-- Center Branding -->
            <div style="text-align: center; flex: 1;">
              <div style="font-size: 50px; margin-bottom: 12px;">🎓</div>
              <p style="
                font-size: 36px; 
                font-weight: 900;
                color: #2563eb;
                margin: 0 0 6px 0;
              ">TRAINIFY</p>
              <p style="color: #6b7280; font-size: 16px; margin: 0; font-weight: 600;">Learning Platform</p>
            </div>

            <!-- Enhanced Realistic Signature Section -->
            <div style="text-align: center; flex: 1;">
              <div style="
                width: 220px; 
                border-bottom: 3px solid #6b7280; 
                margin: 0 auto 15px auto;
                position: relative;
                height: 70px;
                display: flex;
                align-items: flex-end;
                justify-content: center;
              ">
                <!-- Canvas-compatible handwritten signature using CSS styling -->
                <div style="
                  font-family: 'Brush Script MT', 'Lucida Handwriting', 'Dancing Script', cursive;
                  font-size: 28px;
                  color: #1f2937;
                  font-weight: 600;
                  transform: rotate(-3deg) skewX(-5deg);
                  letter-spacing: 2px;
                  margin-bottom: 8px;
                  text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
                  position: relative;
                ">
                  <span style="position: relative; z-index: 2;">Yash Saxena</span>
                  <!-- Underline flourish -->
                  <div style="
                    position: absolute;
                    bottom: -3px;
                    left: -10px;
                    right: -10px;
                    height: 2px;
                    background: linear-gradient(to right, transparent 0%, #1f2937 20%, #1f2937 80%, transparent 100%);
                    transform: rotate(1deg);
                    opacity: 0.6;
                  "></div>
                </div>
              </div>
              <p style="color: #1f2937; font-weight: bold; margin: 0 0 8px 0; font-size: 20px;">Yash Saxena</p>
              <p style="color: #6b7280; font-weight: 600; margin: 0; font-size: 16px;">Platform Administrator</p>
            </div>
          </div>
        </div>
      </div>
    `;

    tempContainer.innerHTML = certificateHTML;
    document.body.appendChild(tempContainer);

    // Wait for fonts and styles to load
    await new Promise(resolve => setTimeout(resolve, 200));

    const certificateElement = document.getElementById('certificate-content');
    
    if (!certificateElement) {
      throw new Error('Certificate element not found');
    }

    // Generate canvas with improved settings
    const canvas = await html2canvas.default(certificateElement, {
      scale: 1.5, // Reduced scale for better performance
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 1200,
      height: 900, // Increased height
      logging: false,
      scrollX: 0,
      scrollY: 0,
      windowWidth: 1200,
      windowHeight: 900,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById('certificate-content');
        if (clonedElement) {
          clonedElement.style.display = 'block';
          clonedElement.style.visibility = 'visible';
          clonedElement.style.position = 'relative';
        }
      }
    });

    // Clean up - remove temporary element
    document.body.removeChild(tempContainer);

    // Generate PDF with proper dimensions
    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF('landscape', 'mm', 'a4'); // A4 landscape: 297x210mm
    
    // Calculate dimensions to fit the entire certificate
    const pdfWidth = 297;
    const pdfHeight = 210;
    const imgAspectRatio = canvas.width / canvas.height;
    const pdfAspectRatio = pdfWidth / pdfHeight;
    
    let finalWidth, finalHeight, x, y;
    
    if (imgAspectRatio > pdfAspectRatio) {
      // Image is wider, fit by width
      finalWidth = pdfWidth;
      finalHeight = pdfWidth / imgAspectRatio;
      x = 0;
      y = (pdfHeight - finalHeight) / 2;
    } else {
      // Image is taller, fit by height
      finalHeight = pdfHeight;
      finalWidth = pdfHeight * imgAspectRatio;
      x = (pdfWidth - finalWidth) / 2;
      y = 0;
    }
    
    pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
    
    // Download with sanitized filename
    const sanitizeName = (name) => name?.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_') || 'Student';
    const sanitizeTitle = (title) => title?.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_') || 'Course';
    
    const fileName = `Trainify_Certificate_${sanitizeName(user?.name)}_${sanitizeTitle(course.title)}.pdf`;
    pdf.save(fileName);

    toast.dismiss('cert-gen');
    toast.success("🎉 Certificate downloaded successfully!");
    return true;

  } catch (error) {
    toast.dismiss('cert-gen');
    console.error("Certificate generation error:", error);
    
    // Fallback: Generate simple text-based PDF
    try {
      const { default: jsPDF } = await import('jspdf');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      
      // Simple text-based certificate as fallback
      pdf.setFontSize(40);
      pdf.text('CERTIFICATE OF COMPLETION', 148, 40, { align: 'center' });
      
      pdf.setFontSize(20);
      pdf.text('This is to certify that', 148, 70, { align: 'center' });
      
      pdf.setFontSize(30);
      pdf.text(user?.name || 'Student Name', 148, 90, { align: 'center' });
      
      pdf.setFontSize(20);
      pdf.text('has successfully completed', 148, 110, { align: 'center' });
      
      pdf.setFontSize(25);
      pdf.text(`"${course.title}"`, 148, 130, { align: 'center' });
      
      pdf.setFontSize(15);
      pdf.text(`Date: ${new Date().toLocaleDateString("en-GB")}`, 50, 170);
      pdf.text('TRAINIFY Learning Platform', 200, 170);
      pdf.text('Yash Saxena - Platform Administrator', 148, 190, { align: 'center' });
      
      const fileName = `Trainify_Certificate_${user?.name?.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      pdf.save(fileName);
      
      toast.success("📄 Certificate downloaded (simplified version)");
      return true;
      
    } catch (fallbackError) {
      console.error("Fallback certificate generation failed:", fallbackError);
      toast.error("Failed to generate certificate. Please try again or contact support.");
      return false;
    }
  }
};

export const validateCourseCompletion = (course, userProgress) => {
  if (!course || !userProgress) return false;
  
  const progress = userProgress[course._id];
  if (!progress) return false;
  
  return progress.percentage === "100%" || 
         progress.percentage === "100.00%" || 
         progress.isCompleted || 
         progress.isFullyCompleted;
};