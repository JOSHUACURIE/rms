import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';

// ====== CUSTOMIZED GRADE FUNCTIONS ======

// Custom grading for Maths, Kiswahili, English, Physics, Biology, Chemistry
const calculateScienceGrade = (score) => {
  if (!score && score !== 0) return '-';
  const numScore = parseFloat(score);
  if (numScore >= 75) return 'A';
  if (numScore >= 70) return 'A-';
  if (numScore >= 65) return 'B+';
  if (numScore >= 60) return 'B';
  if (numScore >= 55) return 'B-';
  if (numScore >= 50) return 'C+';
  if (numScore >= 45) return 'C';
  if (numScore >= 40) return 'C-';
  if (numScore >= 35) return 'D+';
  if (numScore >= 30) return 'D';
  if (numScore >= 25) return 'D-';
  return 'E';
};

// Custom grading for CRE, History, Geography, Agriculture, Business
const calculateHumanitiesGrade = (score) => {
  if (!score && score !== 0) return '-';
  const numScore = parseFloat(score);
  if (numScore >= 80) return 'A';
  if (numScore >= 75) return 'A-';
  if (numScore >= 70) return 'B+';
  if (numScore >= 65) return 'B';
  if (numScore >= 60) return 'B-';
  if (numScore >= 55) return 'C+';
  if (numScore >= 50) return 'C';
  if (numScore >= 45) return 'C-';
  if (numScore >= 40) return 'D+';
  if (numScore >= 35) return 'D';
  if (numScore >= 30) return 'D-';
  return 'E';
};

// Main grade calculation function that routes to appropriate grading system
const calculateGrade = (score, subjectName = '') => {
  if (!score && score !== 0) return '-';
  
  const subject = (subjectName || '').toUpperCase().trim();
  
  // Science subjects with custom grading
  const scienceSubjects = ['MATHEMATICS', 'MATHS', 'MAT', 'KISWAHILI', 'KIS', 'ENGLISH', 'ENG', 'PHYSICS', 'PHY', 'BIOLOGY', 'BIO', 'CHEMISTRY', 'CHEM'];
  
  // Humanities subjects with custom grading
  const humanitiesSubjects = ['CRE', 'HISTORY', 'HIST', 'GEOGRAPHY', 'GEO', 'AGRICULTURE', 'AGR', 'BUSINESS', 'BST'];
  
  if (scienceSubjects.includes(subject)) {
    return calculateScienceGrade(score);
  } else if (humanitiesSubjects.includes(subject)) {
    return calculateHumanitiesGrade(score);
  }
  
  // Default grading for any other subjects
  return calculateScienceGrade(score); // Fallback to science grading
};

const calculateTotalGrade = (totalScore, maxPossible = 1100) => {
  if (!totalScore && totalScore !== 0) return '-';
  const percentage = (totalScore / maxPossible) * 100;
  if (percentage >= 78) return 'A';
  if (percentage >= 75) return 'A-';
  if (percentage >= 70) return 'B+';
  if (percentage >= 65) return 'B';
  if (percentage >= 55) return 'B-';
  if (percentage >= 48) return 'C+';
  if (percentage >= 40) return 'C';
  if (percentage >= 35) return 'C-';
  if (percentage >= 30) return 'D+';
  if (percentage >= 25) return 'D';
  if (percentage >= 20) return 'D-';
  return 'E';
};

const formatScoreWithGrade = (score, subjectName = '') => {
  if (!score && score !== 0) return '-';
  const grade = calculateGrade(score, subjectName);
  return `${Math.round(score)}${grade}`;
};

// ====== SUBJECT ORDERING ======

// Define the specific subject order
const SUBJECT_ORDER = [
  'MATHEMATICS', 'MATHS', 'MAT',
  'ENGLISH', 'ENG', 
  'KISWAHILI', 'KIS', 
  'BIOLOGY', 'BIO',
  'CHEMISTRY', 'CHEM',
  'PHYSICS', 'PHY',
  'GEOGRAPHY', 'GEO',
  'CRE',
  'HISTORY', 'HIST',
  'BUSINESS', 'BST',
  'AGRICULTURE', 'AGR'
];

const getSubjectPriority = (subjectName) => {
  const upperSubject = subjectName.toUpperCase();
  for (let i = 0; i < SUBJECT_ORDER.length; i++) {
    if (upperSubject.includes(SUBJECT_ORDER[i])) {
      return i;
    }
  }
  return SUBJECT_ORDER.length; // Put unknown subjects at the end
};

const getUniqueSubjects = (students) => {
  const subjects = new Set();
  students.forEach(student => {
    (student.subject_scores || []).forEach(score => {
      if (score.subject_name) {
        subjects.add(score.subject_name);
      }
    });
  });
  
  // Sort subjects according to the specified order
  return Array.from(subjects).sort((a, b) => {
    const priorityA = getSubjectPriority(a);
    const priorityB = getSubjectPriority(b);
    return priorityA - priorityB;
  });
};

// ====== DEFAULT TEACHERS MAP ======
const DEFAULT_TEACHERS = {
  'BUSINESS': 'OJWANG W.',
  'CRE': 'MILKA O.',
  'PHYSICS': 'ODWAR J.',
  'MATHEMATICS': 'ODWAR J.',
  'CHEMISTRY': 'KENNEDY O.',
  'HISTORY': 'PAUL O.',
  'AGRICULTURE': 'BRIAN O.',
  'KISWAHILI': 'OJWANG W.',
  'ENGLISH': 'BRIAN O.',
  'BIOLOGY': 'KENNEDY O.',
  'GEOGRAPHY': 'ODHIAMBO C.'
};

export const getTeacherForSubject = (subjectName) => {
  if (!subjectName) return 'N/A';
  return DEFAULT_TEACHERS[subjectName.toUpperCase().trim()] || 'N/A';
};

const calculateSubjectMean = (students, subject) => {
  const scores = students.map(student => {
    const subjectScore = student.subject_scores?.find(s => s.subject_name === subject);
    return subjectScore ? parseFloat(subjectScore.score) || 0 : 0;
  });
  const sum = scores.reduce((total, score) => total + score, 0);
  return scores.length > 0 ? sum / scores.length : 0;
};

const calculateClassMean = (students) => {
  const totalScores = students.map(student =>
    student.total_score ||
    student.subject_scores?.reduce((sum, score) => sum + (parseFloat(score.score) || 0), 0) || 0
  );
  const sum = totalScores.reduce((total, score) => total + score, 0);
  return totalScores.length > 0 ? sum / totalScores.length : 0;
};

const calculateSubjectRankings = (students, subjects) => {
  return subjects.map(subject => {
    const scores = students
      .map(student => {
        const scoreObj = student.subject_scores?.find(s => s.subject_name === subject);
        return scoreObj ? parseFloat(scoreObj.score) || 0 : 0;
      })
      .filter(score => score > 0);
    const mean = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
    const grade = calculateGrade(mean, subject);
    return {
      subject,
      mean,
      grade,
      teacher: getTeacherForSubject(subject)
    };
  })
  .sort((a, b) => b.mean - a.mean)
  .map((stat, index) => ({ ...stat, position: index + 1 }));
};

const getSubjectAbbreviation = (subjectName) => {
  const abbreviations = {
    'ENGLISH': 'ENG',
    'ENG': 'ENG',
    'KISWAHILI': 'KIS',
    'KIS': 'KIS',
    'MATHEMATICS': 'MAT',
    'MATHS': 'MAT',
    'MAT': 'MAT',
    'CHEMISTRY': 'CHEM',
    'CHEM': 'CHEM',
    'BIOLOGY': 'BIO',
    'BIO': 'BIO',
    'PHYSICS': 'PHY',
    'PHY': 'PHY',
    'HISTORY': 'HIST',
    'HIST': 'HIST',
    'GEOGRAPHY': 'GEO',
    'GEO': 'GEO',
    'CRE': 'CRE',
    'AGRICULTURE': 'AGR',
    'AGR': 'AGR',
    'BUSINESS': 'BST',
    'BST': 'BST'
  };
  const upperSubject = subjectName.toUpperCase();
  return abbreviations[upperSubject] || subjectName.substring(0, 4).toUpperCase();
};

const getGradeRemarks = (grade) => {
  const remarks = {
    'A': 'Excellent',
    'A-': 'Very Good',
    'B+': 'Good Attempt!',
    'B': 'Good Attempt!',
    'B-': 'Good',
    'C+': 'Average',
    'C': 'Average',
    'C-': 'Can do better!',
    'D+': 'Aim higher',
    'D': 'Weak ',
    'D-': 'Pull up your socks',
    'E': 'Pull up your socks'
  };
  return remarks[grade] || 'Performance assessment pending';
};

const getGradeColor = (grade) => {
  const colors = {
    'A': '#2E8B57',   // Emerald Green
    'A-': '#2E8B57',
    'B+': '#28A79A',  // Teal
    'B': '#28A79A',
    'B-': '#28A79A',
    'C+': '#FFA726',  // Amber
    'C': '#FFA726',
    'C-': '#FFA726',
    'D+': '#EF5350',  // Soft Red
    'D': '#EF5350',
    'D-': '#EF5350',
    'E': '#990000'    // Dark Red
  };
  return colors[grade] || '#000000';
};

// ====== INDIVIDUAL PDF EXPORT ======
export const exportIndividualResultToPDF = async (student, subjects = [], comments = {}, imageBase64 = null, totalStudents = 0) => {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 8;
    const contentWidth = pageWidth - (margin * 2);

    pdf.setFont('helvetica');

    // ====== HEADER SECTION ======
    if (imageBase64) {
      try {
        let cleanBase64 = imageBase64;
        if (imageBase64.startsWith('data:image')) {
          cleanBase64 = imageBase64.split(',')[1];
        }
        if (cleanBase64 && cleanBase64.length > 100) {
          const imgData = `data:image/jpeg;base64,${cleanBase64}`;
          const img = new Image();
          img.onload = function() {};
          img.onerror = function() {
            console.warn('Image failed to load, will skip logo');
          };
          img.src = imgData;
          pdf.addImage(imgData, 'JPEG', margin, 10, 25, 25);
        }
      } catch (imgError) {
        console.warn('Could not add logo to PDF:', imgError);
      }
    }

    pdf.setFillColor(10, 46, 92);
    pdf.rect(0, 0, pageWidth, 32, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ST PETERS MAWENI GIRLS SECONDARY SCHOOL', pageWidth / 2, 14, { align: 'center' });
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text('P.O. BOX 941-40400 SUNA MIGORI', pageWidth / 2, 21, { align: 'center' });
    pdf.text('Email: stpetersmaweni@gmail.com', pageWidth / 2, 26, { align: 'center' });

    pdf.setTextColor(10, 46, 92);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ACADEMIC PERFORMANCE REPORT', pageWidth / 2, 38, { align: 'center' });

    let yPosition = 45;

    // ====== STUDENT INFORMATION SECTION ======
    const infoBoxHeight = 32;
    
    pdf.setTextColor(10, 46, 92);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('STUDENT INFORMATION', margin + 8, yPosition + 9);
    
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Name: ${student.fullname || student.name}`, margin + 8, yPosition + 15);
    pdf.text(`Adm No: ${student.admission_number || student.admission_no}`, margin + 8, yPosition + 21);
    pdf.text(`Class: ${student.class_name || student.form}`, margin + 8, yPosition + 27);

    const totalMarks = student.total_score || subjects.reduce((sum, s) => sum + (parseFloat(s.score) || 0), 0);
    const percentage = ((totalMarks / 1100) * 100).toFixed(1);
    const overallGrade = student.overall_grade || calculateTotalGrade(totalMarks);
    const classRankDisplay = student.class_rank ? `#${student.class_rank}` : 'N/A';

    pdf.setTextColor(10, 46, 92);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ACADEMIC SUMMARY', margin + contentWidth / 2 + 8, yPosition + 9);
    
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Marks: ${Math.round(totalMarks)}`, margin + contentWidth / 2 + 8, yPosition + 15);
    pdf.text(`Percent: ${percentage}%`, margin + contentWidth / 2 + 8, yPosition + 21);
    pdf.text(`Grade: ${overallGrade}`, margin + contentWidth / 2 + 8, yPosition + 27);
    pdf.text(`Class Rank: ${classRankDisplay}/${totalStudents}`, margin + contentWidth / 2 + 8, yPosition + 33);

    yPosition += infoBoxHeight + 10;

    // ====== SUBJECT PERFORMANCE TABLE ======
    pdf.setTextColor(10, 46, 92);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('SUBJECT PERFORMANCE ANALYSIS', margin, yPosition);
    yPosition += 8;

    const columnWidths = {
      subject: 50,
      score: 15,
      grade: 15,
      teacher: 35,
      remarks: 65
    };

    const columnPositions = {
      subject: margin + 5,
      score: margin + 5 + columnWidths.subject,
      grade: margin + 5 + columnWidths.subject + columnWidths.score,
      teacher: margin + 5 + columnWidths.subject + columnWidths.score + columnWidths.grade,
      remarks: margin + 5 + columnWidths.subject + columnWidths.score + columnWidths.grade + columnWidths.teacher
    };

    // Table header
    pdf.setFillColor(10, 46, 92);
    pdf.rect(margin, yPosition, contentWidth, 9, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.text('SUBJECT', columnPositions.subject, yPosition + 6);
    pdf.text('SCORE', columnPositions.score, yPosition + 6);
    pdf.text('GRADE', columnPositions.grade, yPosition + 6);
    pdf.text('TEACHER', columnPositions.teacher, yPosition + 6);
    pdf.text('REMARKS', columnPositions.remarks, yPosition + 6);

    yPosition += 9;

    // Sort subjects according to specified order
    const sortedSubjects = [...subjects].sort((a, b) => {
      const subjectA = (a.subject_name || a.name || '').toLowerCase();
      const subjectB = (b.subject_name || b.name || '').toLowerCase();
      const priorityA = getSubjectPriority(subjectA);
      const priorityB = getSubjectPriority(subjectB);
      return priorityA - priorityB;
    });
    
    const rowHeight = 8;
    const maxTableHeight = pageHeight - yPosition - 80;
    const availableRows = Math.floor(maxTableHeight / rowHeight);
    
    const processSubjectData = (subject) => {
      const subjectName = subject.subject_name || subject.name || 'N/A';
      const score = Math.round(subject.score || 0);
      const grade = subject.grade || calculateGrade(subject.score, subjectName) || 'N/A';
      const teacher = subject.teacher || getTeacherForSubject(subjectName) || 'N/A';
      const remarks = subject.remarks || getGradeRemarks(grade) || 'Good';
      
      return {
        subject: subjectName.length > 25 ? subjectName.substring(0, 25) + '...' : subjectName,
        score: String(score),
        grade: grade,
        teacher: teacher.length > 18 ? teacher.substring(0, 18) + '...' : teacher,
        remarks: remarks.length > 35 ? remarks.substring(0, 35) + '...' : remarks
      };
    };
    
    const displayedSubjects = sortedSubjects.slice(0, availableRows);
    
    displayedSubjects.forEach((subject, index) => {
      const subjectData = processSubjectData(subject);
      
      if (index % 2 === 0) {
        pdf.setFillColor(248, 249, 250);
        pdf.rect(margin, yPosition, contentWidth, rowHeight, 'F');
      }

      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      
      pdf.text(subjectData.subject, columnPositions.subject, yPosition + 5.5);
      pdf.text(subjectData.score, columnPositions.score, yPosition + 5.5);
      
      pdf.setTextColor(getGradeColor(subjectData.grade));
      pdf.text(subjectData.grade, columnPositions.grade, yPosition + 5.5);
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      pdf.text(subjectData.teacher, columnPositions.teacher, yPosition + 5.5);
      pdf.text(subjectData.remarks, columnPositions.remarks, yPosition + 5.5, {
        maxWidth: columnWidths.remarks - 5,
        align: 'left'
      });

      yPosition += rowHeight;
    });

    if (subjects.length > availableRows) {
      yPosition += 4;
      pdf.setTextColor(102, 102, 102);
      pdf.setFontSize(7);
      pdf.text(`+ ${subjects.length - availableRows} more subjects...`, columnPositions.subject, yPosition);
      yPosition += 5;
    }

    yPosition += 8;

    // ====== COMMENTS SECTION ======
    const remainingSpace = pageHeight - yPosition - 30;
    const commentsHeight = Math.min(45, remainingSpace);
    
    pdf.setFillColor(248, 249, 250);
    pdf.rect(margin, yPosition, contentWidth, commentsHeight, 'F');
    
    pdf.setTextColor(10, 46, 92);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('OFFICIAL COMMENTS', margin + 8, yPosition + 10);

    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    const principalComment = comments.principal || "Good performance. Maintain consistency and focus on continuous improvement.";
    pdf.text('Principal\'s Comment:', margin + 8, yPosition + 16);
    pdf.text(principalComment, margin + 8, yPosition + 21, { 
      maxWidth: contentWidth - 16,
      align: 'left'
    });
    
    const teacherComment = comments.class_teacher || "Shows great dedication and consistent improvement in academic performance.";
    pdf.text('Class Teacher\'s Comment:', margin + 8, yPosition + 30);
    pdf.text(teacherComment, margin + 8, yPosition + 35, { 
      maxWidth: contentWidth - 16,
      align: 'left'
    });

    yPosition += commentsHeight + 8;

    // ====== FEE BALANCE ======
    const feeBalanceColor = student.fee_balance > 0 ? '#EF5350' : '#2E8B57';
    pdf.setTextColor(feeBalanceColor);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Fee Balance: KSh ${student.fee_balance || "_________________"}`, margin + 8, yPosition);
    
    yPosition += 10;

    // ====== SIGNATURES SECTION ======
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    
    pdf.text('_________________________', margin + 30, yPosition);
    pdf.text("Principal's Signature", margin + 45, yPosition + 6);
    
    pdf.text('_________________________', margin + contentWidth - 90, yPosition);
    pdf.text("Class Teacher's Signature", margin + contentWidth - 82, yPosition + 6);

    yPosition += 15;

    // ====== FOOTER ======
    pdf.setFontSize(8);
    pdf.setTextColor(102, 102, 102);
    pdf.text('Generated by LeraTech Academic System', pageWidth - margin, pageHeight - 12, { align: 'right' });
    pdf.text(`Report generated on: ${new Date().toLocaleDateString()}`, pageWidth - margin, pageHeight - 7, { align: 'right' });

    const pdfBlob = pdf.output('blob');
    return pdfBlob;

  } catch (error) {
    console.error('Error generating PDF document:', error);
    throw new Error('Failed to generate PDF document: ' + error.message);
  }
};

// ====== EXCEL EXPORT ======
export const exportResultsToExcel = async (students, filters = {}, filterOptions = {}) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Results');
    const subjects = getUniqueSubjects(students);

    const baseColumns = [
      { header: 'ADM.NO', key: 'admission_no', width: 8 },
      { header: 'NAME', key: 'name', width: 30 }
    ];
    
    // Add subject columns in the specified order
    const subjectColumns = subjects.map(subject => ({
      header: getSubjectAbbreviation(subject),
      key: `subject_${subject}`,
      width: 8
    }));
    
    const summaryColumns = [
      { header: 'TT MARKS', key: 'total_marks', width: 10 },
      { header: 'GRADE', key: 'total_grade', width: 8 },
      { header: 'C RANK', key: 'class_rank', width: 8 }
    ];
    
    const allColumns = [...baseColumns, ...subjectColumns, ...summaryColumns];
    worksheet.columns = allColumns;

    for (let i = 0; i < 4; i++) {
      worksheet.addRow([]);
    }

    const headerRow = worksheet.getRow(5);
    headerRow.values = allColumns.map(col => col.header);
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: 'center' };
    headerRow.height = 25;

    let currentRow = 6;
    const sortedStudents = [...students].sort((a, b) => {
      const rankA = a.class_rank || Number.MAX_SAFE_INTEGER;
      const rankB = b.class_rank || Number.MAX_SAFE_INTEGER;
      return rankA - rankB;
    });

    sortedStudents.forEach((student) => {
      const rowData = {
        admission_no: student.admission_number || student.admission_no,
        name: student.fullname || student.name
      };

      // Add subject scores in the specified order
      subjects.forEach(subject => {
        const subjectScore = student.subject_scores?.find(score => score.subject_name === subject);
        const score = subjectScore ? subjectScore.score : '-';
        rowData[`subject_${subject}`] = score !== '-' ? formatScoreWithGrade(score, subject) : '-';
      });

      const totalMarks = student.total_score ||
        student.subject_scores?.reduce((sum, score) => sum + (parseFloat(score.score) || 0), 0) || 0;
      rowData.total_marks = Math.round(totalMarks);
      rowData.total_grade = calculateTotalGrade(totalMarks);
      rowData.class_rank = student.class_rank || '';

      const row = worksheet.addRow(rowData);
      row.eachCell((cell, colNumber) => {
        if (colNumber !== 2) {
          cell.alignment = { horizontal: 'center' };
        }
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    const statsStartRow = currentRow + sortedStudents.length + 2;
    worksheet.mergeCells(`A${statsStartRow}:B${statsStartRow}`);
    worksheet.getCell(`A${statsStartRow}`).value = 'MEAN';
    worksheet.getCell(`A${statsStartRow}`).font = { bold: true };

    subjects.forEach((subject, index) => {
      const colLetter = String.fromCharCode(67 + index);
      const meanScore = calculateSubjectMean(sortedStudents, subject);
      worksheet.getCell(`${colLetter}${statsStartRow}`).value = meanScore.toFixed(2);
      worksheet.getCell(`${colLetter}${statsStartRow}`).alignment = { horizontal: 'center' };
    });

    worksheet.addRow([]);
    worksheet.addRow([]);

    const ranksStartRow = statsStartRow + 3;
    worksheet.mergeCells(`A${ranksStartRow}:E${ranksStartRow}`);
    worksheet.getCell(`A${ranksStartRow}`).value = 'SUBJECT RANKS';
    worksheet.getCell(`A${ranksStartRow}`).font = { bold: true, size: 14 };

    const ranksHeaderRow = worksheet.getRow(ranksStartRow + 1);
    ranksHeaderRow.values = ['SUBJECT', 'MEAN', 'GRADE', 'TEACHER', 'POSITION'];
    ranksHeaderRow.font = { bold: true };
    ranksHeaderRow.alignment = { horizontal: 'center' };

    const subjectRanks = calculateSubjectRankings(sortedStudents, subjects);
    subjectRanks.forEach((rank) => {
      const row = worksheet.addRow([
        getSubjectAbbreviation(rank.subject),
        rank.mean.toFixed(2),
        rank.grade,
        rank.teacher,
        rank.position
      ]);
      row.alignment = { horizontal: 'center' };
    });

    const classMeanRow = ranksStartRow + subjectRanks.length + 2;
    worksheet.mergeCells(`A${classMeanRow}:D${classMeanRow}`);
    worksheet.getCell(`A${classMeanRow}`).value = 'CLASS MEAN';
    worksheet.getCell(`A${classMeanRow}`).font = { bold: true };
    const classMean = calculateClassMean(sortedStudents);
    worksheet.getCell(`E${classMeanRow}`).value = classMean.toFixed(2);
    worksheet.getCell(`E${classMeanRow}`).alignment = { horizontal: 'center' };
    worksheet.getCell(`F${classMeanRow}`).value = calculateGrade(classMean);
    worksheet.getCell(`F${classMeanRow}`).alignment = { horizontal: 'center' };

    const buffer = await workbook.xlsx.writeBuffer();
    return new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Failed to generate Excel file: ' + error.message);
  }
};

// ====== HELPER FUNCTIONS ======
export const loadImageAsBase64 = async (imageUrl) => {
  try {
    const fullImageUrl = imageUrl.startsWith('/') ? `${window.location.origin}${imageUrl}` : imageUrl;
    console.log('Loading image from:', fullImageUrl);
    
    const response = await fetch(fullImageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          const result = reader.result;
          if (typeof result === 'string') {
            console.log('Image loaded successfully, total length:', result.length);
            resolve(result);
          } else {
            reject(new Error('Failed to read image as base64'));
          }
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        reject(new Error('Failed to read image file'));
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error loading image as base64:', error);
    return null;
  }
};

export const exportIndividualResultAsHTML = async (student, subjects = [], comments = {}, logoUrl = null, totalStudents = 0) => {
  // Sort subjects according to specified order
  const sortedSubjects = [...subjects].sort((a, b) => {
    const subjectA = (a.subject_name || a.name || '').toLowerCase();
    const subjectB = (b.subject_name || b.name || '').toLowerCase();
    const priorityA = getSubjectPriority(subjectA);
    const priorityB = getSubjectPriority(subjectB);
    return priorityA - priorityB;
  });

  const enrichedSubjects = sortedSubjects.map(subj => ({
    ...subj,
    teacher: subj.teacher || getTeacherForSubject(subj.subject_name),
    grade: subj.grade || calculateGrade(subj.score, subj.subject_name) // FIXED: Pass subject name
  }));

  const totalMarks = student.total_score || enrichedSubjects.reduce((sum, s) => sum + (parseFloat(s.score) || 0), 0);
  const percentage = ((totalMarks / 1100) * 100).toFixed(1);
  const overallGrade = student.overall_grade || calculateTotalGrade(totalMarks);
  const gradeClass = overallGrade.startsWith('A') ? 'A' :
                     overallGrade.startsWith('B') ? 'B' :
                     overallGrade.startsWith('C') ? 'C' : 'D';

  const classRankDisplay = student.class_rank ? `#${student.class_rank} out of ${totalStudents}` : `N/A out of ${totalStudents}`;
  const streamRankDisplay = student.stream_rank ? `#${student.stream_rank} out of ${totalStudents}` : `N/A out of ${totalStudents}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Individual Academic Report - ${student.fullname || student.name}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        body { 
          font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          margin: 0;
          padding: 40px;
          line-height: 1.6;
          color: #333;
          background: #F8F9FA;
        }
        .report-container {
          max-width: 1000px;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          box-shadow: 0 6px 20px rgba(10, 46, 92, 0.12);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #0A2E5C 0%, #1A3F6D 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .school-name {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .report-title {
          font-size: 28px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin: 15px 0;
          color: #28A79A;
        }
        .section-title {
          font-size: 20px;
          font-weight: 700;
          color: #0A2E5C;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid #E9ECEF;
        }
        .info-card {
          background: #F8F9FA;
          padding: 25px;
          border-radius: 10px;
          border-left: 4px solid #0A2E5C;
        }
        .info-card h3 {
          margin: 0 0 15px 0;
          color: #0A2E5C;
          font-size: 16px;
          font-weight: 700;
        }
        .grade-A { color: #2E8B57; font-weight: 700; }
        .grade-B { color: #28A79A; font-weight: 700; }
        .grade-C { color: #FFA726; font-weight: 700; }
        .grade-D { color: #EF5350; font-weight: 700; }

        .subject-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(10, 46, 92, 0.08);
        }
        .subject-table th {
          background: #0A2E5C;
          color: white;
          padding: 14px 16px;
          text-align: center;
          font-weight: 600;
          font-size: 14px;
        }
        .subject-table td {
          padding: 12px 16px;
          border-bottom: 1px solid #E9ECEF;
          text-align: center;
        }
        .subject-table tr:nth-child(even) {
          background: #FBFCFD;
        }
        .comments-section {
          background: #F8F9FA;
          padding: 25px;
          border-radius: 10px;
          margin: 30px 0;
        }
        .comment-label {
          font-weight: 700;
          color: #0A2E5C;
          margin-bottom: 8px;
          display: block;
        }
        .signature-section {
          margin-top: 50px;
          padding-top: 30px;
          border-top: 2px solid #E9ECEF;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #E9ECEF;
          color: #6C757D;
          font-size: 12px;
          text-align: center;
        }
        @media (max-width: 768px) {
          body { padding: 20px; }
          .info-grid { grid-template-columns: 1fr; }
        }
      </style>
    </head>
    <body>
      <div class="report-container">
        <div class="header">
          <div class="school-name">St Peters Maweni Girls Secondary School</div>
          <div class="report-title">Individual Academic Performance Report</div>
        </div>

        <div class="content" style="padding: 40px;">
          <div class="info-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
            <div class="info-card">
              <h3>STUDENT INFORMATION</h3>
              <div><strong>Full Name:</strong> ${student.fullname || student.name}</div>
              <div><strong>Admission No:</strong> ${student.admission_number || student.admission_no}</div>
              <div><strong>Class:</strong> ${student.class_name || student.form} ${student.stream_name || student.stream || ''}</div>
            </div>
            <div class="info-card">
              <h3>ACADEMIC SUMMARY</h3>
              <div><strong>Total Marks:</strong> ${Math.round(totalMarks)}</div>
              <div><strong>Percentage:</strong> ${percentage}%</div>
              <div><strong>Overall Grade:</strong> <span class="grade-${gradeClass}">${overallGrade}</span></div>
              <div><strong>Class Rank:</strong> ${classRankDisplay}</div>
              <div><strong>Stream Rank:</strong> ${streamRankDisplay}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Subject Performance Analysis</div>
            ${enrichedSubjects.length > 0 ? `
              <table class="subject-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Score</th>
                    <th>Grade</th>
                    <th>Teacher</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  ${enrichedSubjects.map(subject => {
                    const score = Math.round(subject.score || 0);
                    const grade = subject.grade || calculateGrade(subject.score, subject.subject_name);
                    const gClass = grade.startsWith('A') ? 'A' :
                                   grade.startsWith('B') ? 'B' :
                                   grade.startsWith('C') ? 'C' : 'D';
                    return `
                      <tr>
                        <td><strong>${subject.subject_name || subject.name}</strong></td>
                        <td><strong>${score}</strong></td>
                        <td class="grade-${gClass}">${grade}</td>
                        <td>${subject.teacher || 'N/A'}</td>
                        <td>${subject.remarks || getGradeRemarks(grade)}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            ` : '<p style="text-align: center; color: #666;">No subject data available</p>'}
          </div>

          <div class="comments-section">
            <div class="section-title">Official Comments</div>
            <div>
              <span class="comment-label">Principal's Comment:</span>
              <div>${comments.principal || "Good performance. Maintain consistency and focus on continuous improvement."}</div>
            </div>
            <div style="margin-top: 15px;">
              <span class="comment-label">Class Teacher's Comment:</span>
              <div>${comments.class_teacher || "Shows great dedication and consistent improvement in academic performance."}</div>
            </div>
            <div style="margin-top: 15px;">
              <span class="comment-label">Fee Balance:</span>
              <div style="color: ${student.fee_balance > 0 ? '#EF5350' : '#2E8B57'};">
                KSh ${student.fee_balance || "0.00"}
              </div>
            </div>
          </div>

          <div class="signature-section">
            <div style="display: flex; justify-content: space-between; gap: 40px;">
              <div style="text-align: center; flex: 1;">
                <div style="border-bottom: 1px solid #333; padding-bottom: 5px; margin-bottom: 8px;">&nbsp;</div>
                <div>Principal's Signature</div>
              </div>
              <div style="text-align: center; flex: 1;">
                <div style="border-bottom: 1px solid #333; padding-bottom: 5px; margin-bottom: 8px;">&nbsp;</div>
                <div>Class Teacher's Signature</div>
              </div>
            </div>
          </div>

          <div class="footer">
            <div>Generated by Leratech Academic System</div>
            <div>Report generated on: ${new Date().toLocaleDateString()}</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return new Blob([htmlContent], { type: 'text/html' });
};

export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export const generateFilename = (filters, filterOptions, student = null) => {
  const term = filterOptions.terms?.find(t => t.term_id?.toString() === filters.term_id);
  const className = filterOptions.classes?.find(c => c.class_id?.toString() === filters.class_id)?.class_name;
  const streamName = filterOptions.streams?.find(s => s.stream_id?.toString() === filters.stream_id)?.stream_name;
  if (student) {
    return `Academic_Report_${student.admission_number}_${(student.fullname || student.name).replace(/\s+/g, '_')}.pdf`;
  } else {
    const streamPart = streamName ? `_${streamName}` : '_all_streams';
    return `MAWENI_Results_${className}${streamPart}_${term?.academic_year || ''}.xlsx`;
  }
};

// Export other functions as needed
export {
  calculateGrade,
  calculateTotalGrade,
  formatScoreWithGrade,
  getUniqueSubjects,
  getSubjectPriority,
  calculateScienceGrade,
  calculateHumanitiesGrade
};