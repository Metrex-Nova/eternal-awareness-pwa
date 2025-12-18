// pdf-export.js

async function exportDayPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const date = document.getElementById('date-title').innerText;
    
    // dayId is defined globally in day.html
    const decisions = await getDecisionsForDay(dayId);

    generatePDFContent(doc, date, decisions);
    doc.save(`day-${date.replace(/\s/g, '-')}.pdf`);
}

async function exportFolderPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const folderId = new URLSearchParams(window.location.search).get('id');
    const days = await getDaysInFolder(folderId);

    if (days.length === 0) {
        alert("No data to export in this folder.");
        return;
    }

    for (let i = 0; i < days.length; i++) {
        const decisions = await getDecisionsForDay(days[i].id);
        generatePDFContent(doc, days[i].date, decisions);
        
        // Add a new page for the next day, except for the last one
        if (i < days.length - 1) {
            doc.addPage();
        }
    }

    doc.save(`folder-${folderId}.pdf`);
}

// Reusable formatting function
function generatePDFContent(doc, title, decisions) {
    doc.setFontSize(16);
    doc.setTextColor(44, 44, 44);
    doc.text(title, 20, 20);
    
    let y = 35;
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();

    if (decisions.length === 0) {
        doc.setFontSize(10);
        doc.text("No decisions logged for this day.", margin, y);
        return;
    }

    decisions.forEach((d) => {
        // Check for page overflow
        if (y > 260) {
            doc.addPage();
            y = 20;
        }

        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.text(`TIME: ${d.time}`, margin, y);
        y += 6;

        const fields = [
            { label: "PERMISSION", value: d.task },
            { label: "RDM (PC)", value: d.rdm },
            { label: "IGM (LS)", value: d.igm }
        ];

        fields.forEach(field => {
            doc.setFontSize(8);
            doc.setTextColor(100);
            doc.text(`${field.label}:`, margin, y);
            
            doc.setFontSize(10);
            doc.setTextColor(0);
            const textValue = field.value || "---";
            const splitText = doc.splitTextToSize(textValue, pageWidth - (margin * 2));
            doc.text(splitText, margin + 30, y);
            
            y += (splitText.length * 5) + 2;
        });

        y += 10; // Space between blocks
        doc.setDrawColor(236, 236, 236);
        doc.line(margin, y - 5, pageWidth - margin, y - 5);
    });
}