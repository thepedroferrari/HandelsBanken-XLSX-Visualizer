import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import './App.css';

export default function App() {
  const [htmlData, setHtmlData] = useState([]);
  const [sum, setSum] = useState(0);
  const [table, setTable] = useState<JSX.Element | null>(<div />);

  const inputref = useRef(null);

  const handleOnChange = async (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    if (e.currentTarget.files === null) return;

    console.log(e.currentTarget.files[0]);

    const reader = new FileReader();

    reader.onload = (e) => {
      // var data = new Uint8Array(e.target.result);
      const data = e?.target?.result;
      const workbook = XLSX.read(data, { type: 'array' });
      const name = workbook.SheetNames[0];
      const workSheet = workbook.Sheets[name];

      const parsedData = XLSX.utils
        .sheet_to_json(workSheet, {
          header: 1,
        })
        .slice(11);

      setHtmlData(parsedData as any);

      // const parsedData = XLSX.utils.sheet_(workSheet);

      // console.log(parsedData);

      console.log(parsedData);
    };
    reader.readAsArrayBuffer(e.currentTarget.files[0]);
  };

  useEffect(() => {
    if (htmlData.length === 0) return;
    let curr = 0;
    const list = (
      <>
        {htmlData.map((item) => {
          if ((item as Array<string | number>).length !== 10) return null;
          if (typeof item[7] !== 'number') return null;
          console.log(item);
          curr += item[7];
          return (
            <ul>
              <li>{item[0]}</li>
              <li>{item[2]}</li>
              <li>{item[7]}</li>
            </ul>
          );
        })}
      </>
    );

    setSum(curr);
    setTable(list);
  }, [htmlData]);

  return (
    <>
      <input type="file" ref={inputref} onChange={handleOnChange} />
      <div className="table-container">{table}</div>
      <div>SUM: {sum}</div>
    </>
  );
}
