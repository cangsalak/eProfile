const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');

const sourcePath = path.join(process.cwd(), 'public/uploads/__1789706187419_2wjb5o.docx');
const targetDir = path.join(process.cwd(), 'public/templates/docx');
const targetPath = path.join(targetDir, 'starter_leave_template.docx');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const buf = fs.readFileSync(sourcePath);
const zip = new PizZip(buf);
let xml = zip.file('word/document.xml').asText();

// 1. เขียนที่ {writtenAt}
xml = xml.replace(
  /<w:t xml:space="preserve">เขียนที่ <\/w:t>/,
  '<w:t xml:space="preserve">เขียนที่ </w:t></w:r><w:r><w:rPr><w:rFonts w:ascii="TH SarabunPSK" w:hAnsi="TH SarabunPSK" w:cs="TH SarabunPSK"/><w:sz w:val="28"/><w:szCs w:val="32"/><w:cs/></w:rPr><w:t xml:space="preserve">{writtenAt} </w:t>'
);

// 2. วันที่ {todayDay} เดือน {todayMonth} พ.ศ. {todayYear}
xml = xml.replace(
  /<w:t xml:space="preserve">วันที่ <\/w:t>/,
  '<w:t xml:space="preserve">วันที่ </w:t></w:r><w:r><w:rPr><w:rFonts w:ascii="TH SarabunPSK" w:hAnsi="TH SarabunPSK" w:cs="TH SarabunPSK"/><w:sz w:val="28"/><w:szCs w:val="32"/><w:cs/></w:rPr><w:t xml:space="preserve">{todayDay} </w:t>'
);

xml = xml.replace(
  /<w:t>เดือน<\/w:t>/,
  '<w:t>เดือน</w:t></w:r><w:r><w:rPr><w:rFonts w:ascii="TH SarabunPSK" w:hAnsi="TH SarabunPSK" w:cs="TH SarabunPSK"/><w:sz w:val="28"/><w:szCs w:val="32"/><w:cs/></w:rPr><w:t xml:space="preserve"> {todayMonth} </w:t>'
);

xml = xml.replace(
  /<w:t>พ\.ศ\.<\/w:t>/,
  '<w:t>พ.ศ.</w:t></w:r><w:r><w:rPr><w:rFonts w:ascii="TH SarabunPSK" w:hAnsi="TH SarabunPSK" w:cs="TH SarabunPSK"/><w:sz w:val="28"/><w:szCs w:val="32"/><w:cs/></w:rPr><w:t xml:space="preserve"> {todayYear} </w:t>'
);

// 3. เรียน {toPerson}
xml = xml.replace(
  /<w:t xml:space="preserve">เรียน <\/w:t>/,
  '<w:t xml:space="preserve">เรียน </w:t></w:r><w:r><w:rPr><w:rFonts w:ascii="TH SarabunPSK" w:hAnsi="TH SarabunPSK" w:cs="TH SarabunPSK"/><w:sz w:val="28"/><w:szCs w:val="32"/><w:cs/></w:rPr><w:t xml:space="preserve">{toPerson} </w:t>'
);

// 4. กระผม/ดิฉัน {fullName}
xml = xml.replace(
  /<w:t xml:space="preserve">\/ดิฉัน <\/w:t>/,
  '<w:t xml:space="preserve">/ดิฉัน </w:t></w:r><w:r><w:rPr><w:rFonts w:ascii="TH SarabunPSK" w:hAnsi="TH SarabunPSK" w:cs="TH SarabunPSK"/><w:sz w:val="28"/><w:szCs w:val="32"/><w:cs/></w:rPr><w:t xml:space="preserve">{fullName} </w:t>'
);

// 5. ตำแหน่ง {position}
xml = xml.replace(
  /<w:t>ตำแหน่ง<\/w:t>/,
  '<w:t>ตำแหน่ง</w:t></w:r><w:r><w:rPr><w:rFonts w:ascii="TH SarabunPSK" w:hAnsi="TH SarabunPSK" w:cs="TH SarabunPSK"/><w:sz w:val="28"/><w:szCs w:val="32"/><w:cs/></w:rPr><w:t xml:space="preserve"> {position} </w:t>'
);

// 6. ขออนุญาตลาหยุดราชการเพื่อ {reason}
xml = xml.replace(
  /<w:t xml:space="preserve">ขออนุญาตลาหยุดราชการเพื่อ <\/w:t>/,
  '<w:t xml:space="preserve">ขออนุญาตลาหยุดราชการเพื่อ </w:t></w:r><w:r><w:rPr><w:rFonts w:ascii="TH SarabunPSK" w:hAnsi="TH SarabunPSK" w:cs="TH SarabunPSK"/><w:sz w:val="28"/><w:szCs w:val="32"/><w:cs/></w:rPr><w:t xml:space="preserve">{reason} </w:t>'
);

// 7. มีกำหนดเวลา {totalDays} วัน ตั้งแต่วันที่ {startDay}
xml = xml.replace(
  /<w:t xml:space="preserve">มีกำหนดเวลา <\/w:t>/,
  '<w:t xml:space="preserve">มีกำหนดเวลา </w:t></w:r><w:r><w:rPr><w:rFonts w:ascii="TH SarabunPSK" w:hAnsi="TH SarabunPSK" w:cs="TH SarabunPSK"/><w:sz w:val="28"/><w:szCs w:val="32"/><w:cs/></w:rPr><w:t xml:space="preserve">{totalDays} </w:t>'
);

xml = xml.replace(
  /<w:t>วัน ตั้งแต่วันที่<\/w:t>/,
  '<w:t>วัน ตั้งแต่วันที่</w:t></w:r><w:r><w:rPr><w:rFonts w:ascii="TH SarabunPSK" w:hAnsi="TH SarabunPSK" w:cs="TH SarabunPSK"/><w:sz w:val="28"/><w:szCs w:val="32"/><w:cs/></w:rPr><w:t xml:space="preserve"> {startDay} </w:t>'
);

// 8. เดือน {startMonth}
xml = xml.replace(
  /<w:t xml:space="preserve">เดือน <\/w:t>/,
  '<w:t xml:space="preserve">เดือน </w:t></w:r><w:r><w:rPr><w:rFonts w:ascii="TH SarabunPSK" w:hAnsi="TH SarabunPSK" w:cs="TH SarabunPSK"/><w:sz w:val="28"/><w:szCs w:val="32"/><w:cs/></w:rPr><w:t xml:space="preserve">{startMonth} </w:t>'
);

// 9. พ.ศ. {startYear} จนถึงวันที่ {endDay}
xml = xml.replace(
  /<w:t>จนถึง<\/w:t><w:r><w:rPr>[\s\S]*?<w:t xml:space="preserve">วันที่ <\/w:t>/,
  '<w:t>จนถึงวันที่ </w:t></w:r><w:r><w:rPr><w:rFonts w:ascii="TH SarabunPSK" w:hAnsi="TH SarabunPSK" w:cs="TH SarabunPSK"/><w:sz w:val="28"/><w:szCs w:val="32"/><w:cs/></w:rPr><w:t xml:space="preserve">{endDay} </w:t>'
);

// 10. ในระหว่างลานี้ กระผม/ดิฉันจะไปที่ {contactAddress}
xml = xml.replace(
  /<w:t xml:space="preserve">ในระหว่างลานี้ กระผม\/ดิฉันจะไปที่ <\/w:t>/,
  '<w:t xml:space="preserve">ในระหว่างลานี้ กระผม/ดิฉันจะไปที่ </w:t></w:r><w:r><w:rPr><w:rFonts w:ascii="TH SarabunPSK" w:hAnsi="TH SarabunPSK" w:cs="TH SarabunPSK"/><w:sz w:val="28"/><w:szCs w:val="32"/><w:cs/></w:rPr><w:t xml:space="preserve">{contactAddress} โทร {phone} </w:t>'
);

// 11. (ลงชื่อ) {fullName}
xml = xml.replace(
  /<w:t xml:space="preserve">\(ลงชื่อ\) <\/w:t>/,
  '<w:t xml:space="preserve">(ลงชื่อ) </w:t></w:r><w:r><w:rPr><w:rFonts w:ascii="TH SarabunPSK" w:hAnsi="TH SarabunPSK" w:cs="TH SarabunPSK"/><w:sz w:val="28"/><w:szCs w:val="32"/><w:cs/></w:rPr><w:t xml:space="preserve">{fullName} </w:t>'
);

zip.file('word/document.xml', xml);
const outBuf = zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' });
fs.writeFileSync(targetPath, outBuf);
console.log('Successfully created starter template at:', targetPath);
