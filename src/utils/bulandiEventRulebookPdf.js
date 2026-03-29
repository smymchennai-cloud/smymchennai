import { jsPDF } from 'jspdf';
import { bulandiSubEvents } from '../data/bulandi2026Data';

const DOC_TITLE = 'Bulandi 2026 — Event rulebook';

/**
 * Builds and triggers download of a PDF containing every competition’s prizes and full rules text.
 */
export function downloadBulandiEventRulebookPdf() {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const margin = 14;
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const maxW = pageW - margin * 2;
  const lineH = 5;
  const paraGap = 2;

  let y = 18;

  function newPage() {
    doc.addPage();
    y = 18;
  }

  function ensureSpace(h) {
    if (y + h > pageH - 12) newPage();
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(DOC_TITLE, margin, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const intro = doc.splitTextToSize(
    'Compiled from the SMYM Chennai Bulandi 2026 page. Prize amounts and full rules for each competition are below. Eligibility follows the official age reference date announced for Bulandi 2026.',
    maxW
  );
  intro.forEach((line) => {
    ensureSpace(lineH);
    doc.text(line, margin, y);
    y += lineH;
  });
  y += 3;

  function sectionHeader(text) {
    ensureSpace(10);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(text, margin, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
  }

  function renderEvent(ev) {
    ensureSpace(16);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    const titleLines = doc.splitTextToSize(ev.name, maxW);
    titleLines.forEach((line) => {
      ensureSpace(lineH + 0.5);
      doc.text(line, margin, y);
      y += lineH + 0.5;
    });
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    ensureSpace(lineH);
    doc.text(ev.ageGroupLabel, margin, y);
    y += lineH + 1;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    const prizeBlock = 'Prizes (1st / 2nd / 3rd): ' + ev.prizes;
    doc.splitTextToSize(prizeBlock, maxW).forEach((line) => {
      ensureSpace(lineH);
      doc.text(line, margin, y);
      y += lineH;
    });
    doc.setFont('helvetica', 'normal');
    y += paraGap;

    const paras = String(ev.rules || '')
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter(Boolean);
    paras.forEach((p) => {
      doc.splitTextToSize(p, maxW).forEach((line) => {
        ensureSpace(lineH);
        doc.text(line, margin, y);
        y += lineH;
      });
      y += 1;
    });
    y += 3;
  }

  const u15 = bulandiSubEvents.filter((e) => e.ageGroup === 'under15');
  const o15 = bulandiSubEvents.filter((e) => e.ageGroup === 'over15');

  sectionHeader('Over 5 and under 15 years');
  u15.forEach(renderEvent);

  sectionHeader('15 years and above');
  o15.forEach(renderEvent);

  doc.save('bulandi-2026-event-rulebook.pdf');
}
