import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import './App.css';

interface DateRange {
  from: string;
  to: string;
}

const namesToExclude = ['LÖN', 'savings', 'HUMBLEBUNDLE.C'];
const formatMoney = (number: number) =>
  new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(
    number
  );

export default function App() {
  const [htmlData, setHtmlData] = useState<Array<string | number>[]>([]);
  const [sum, setSum] = useState(0);
  const [table, setTable] = useState<JSX.Element | null>(<div />);
  const [extras, setExtras] = useState(0);

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const startDate = `${year}-${month < 10 ? `0${month}` : month}-01`;
  const endDate = new Date(year, month, 1).toISOString().split('T')[0];
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startDate,
    to: endDate,
  });

  const inputref = useRef(null);

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    if (e.currentTarget.files === null) return;

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
        .slice(11) as (string | number)[][];

      setHtmlData(parsedData);
    };
    reader.readAsArrayBuffer(e.currentTarget.files[0]);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: number
  ) => {
    const isChecked = e.target.checked;
    const addOrSubtract = isChecked ? value * -1 : value;
    setSum((prev) => prev + addOrSubtract);
  };

  const checkWithinDateRange = useCallback(
    (date: string) => {
      const dateToCheck = new Date(date);
      const from = new Date(dateRange.from);
      const to = new Date(dateRange.to);
      return dateToCheck >= from && dateToCheck <= to;
    },
    [dateRange]
  );

  useEffect(() => {
    if (htmlData.length === 0) return;
    let curr = 0;
    const list = (
      <>
        {htmlData.map((item, idontcare) => {
          // remove items that do not contain price data
          if (item.length !== 10) return null;
          // remove items where the item 7 is not the price
          if (typeof item[7] !== 'number') return null;
          // remove items that are not within the date range
          if (checkWithinDateRange(item[0] as string) === false) return null;
          // remove items that are in the list of names to exclude
          if (namesToExclude.includes(item[2] as string)) return null;

          curr += item[7];
          return (
            <ul className="row" key={idontcare}>
              <li>
                <input
                  type="checkbox"
                  onChange={(e) => handleChange(e, item[7] as number)}
                ></input>
              </li>
              <li>{item[0]}</li>
              <li>{item[2]}</li>
              <li>{formatMoney(item[7])}</li>
            </ul>
          );
        })}
      </>
    );

    setSum(curr);
    setTable(list);
  }, [htmlData, dateRange.from, dateRange.to, checkWithinDateRange]);

  const shouldShowForm =
    htmlData.length === 0 || dateRange.from === '' || dateRange.to === '';

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const id = e.target.id as keyof DateRange;

    setDateRange((prev) => ({
      ...prev,
      [id]: e.target.value || '',
    }));

    console.log(dateRange);
  };

  return (
    <main>
      <header>
        <input type="file" ref={inputref} onChange={handleFileUpload} />
        FROM:
        <input
          type="date"
          id="from"
          onChange={handleDateChange}
          value={dateRange.from}
        />
        TO:
        <input
          type="date"
          id="to"
          onChange={handleDateChange}
          value={dateRange.to}
        />
        <ul>
          <li>SUM: {formatMoney(sum * -1)}</li>
          <li>DIVIDED: {formatMoney((sum / 2) * -1)}</li>
          <li>
            <label>
              EXTRAS:{' '}
              <input
                type="number"
                onChange={(e) => setExtras(Number(e.target.value) || 0)}
              />
            </label>
          </li>
          <li>TOTAL: {formatMoney((sum / 2) * -1 + extras)}</li>
        </ul>
      </header>
      <div className="table-container">
        <ul className="row">
          <li>Remove</li>
          <li>Date</li>
          <li>Name</li>
          <li>Value</li>
        </ul>
        {!shouldShowForm && table}
      </div>
    </main>
  );
}
