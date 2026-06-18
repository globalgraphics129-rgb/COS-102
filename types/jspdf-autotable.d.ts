import { jsPDF } from 'jspdf'

declare module 'jspdf-autotable' {
  type RGB = [number, number, number]

  interface Styles {
    fillColor?: RGB
    fontSize?: number
    fontStyle?: string
    halign?: string
    cellWidth?: number
    textColor?: RGB
  }

  interface AutoTableOptions {
    head?: (string | number)[][]
    body?: (string | number)[][]
    startY?: number
    theme?: 'striped' | 'grid' | 'plain'
    headStyles?: Styles
    bodyStyles?: Styles
    columnStyles?: Record<number, Styles>
    margin?: Record<string, number>
    alternateRowStyles?: Styles
    tableLineColor?: RGB
    tableLineWidth?: number
  }

  export default function autoTable(
    doc: jsPDF,
    options: AutoTableOptions
  ): void
}

declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: { finalY: number }
    getNumberOfPages(): number
    setPage(n: number): jsPDF
  }
}
