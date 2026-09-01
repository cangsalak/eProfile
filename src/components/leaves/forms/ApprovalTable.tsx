import React from 'react';

export const ApprovalTable = ({ toPerson }: { toPerson: string | null }) => (
  <div className="w-full h-full bg-white relative pt-8">
    <table className="w-full border-collapse border border-black text-[12pt] text-black">
      <thead>
        <tr>
          <th className="border border-black font-normal py-3" rowSpan={2}>นำเสนอ</th>
          <th className="border border-black font-normal py-3 px-2 w-[15%]" rowSpan={2}>วัน, เดือน, ปี<br />ที่นำเสนอ</th>
          <th className="border border-black font-normal py-3" colSpan={2}>ผู้นำเสนอ</th>
          <th className="border border-black font-normal py-3 w-[15%]" rowSpan={2}>หมายเหตุ</th>
        </tr>
        <tr>
          <th className="border border-black font-normal py-3 w-[45%]">ยศและชื่อ</th>
          <th className="border border-black font-normal py-3 w-[15%]">ตำแหน่ง</th>
        </tr>
      </thead>
      <tbody>
        <tr className="h-[22cm]">
          <td className="border border-black p-4 align-top text-center">{toPerson}</td>
          <td className="border border-black p-4 align-top text-center">......../........./........</td>
          <td className="border border-black p-6 align-top"></td>
          <td className="border border-black p-2 align-top"></td>
          <td className="border border-black p-2 align-top"></td>
        </tr>
      </tbody>
    </table>
  </div>
);
