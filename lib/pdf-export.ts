"use client"

import jsPDF from "jspdf"
import html2canvas from "html2canvas"

export async function exportToPdf(elementId: string, filename: string) {
  const element = document.getElementById(elementId)
  if (!element) {
    console.error(`Element with id ${elementId} not found`)
    return
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
    })

    const imgData = canvas.toDataURL("image/png")

    // A4 size: 210 x 297 mm
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    const imgWidth = 210
    const pageHeight = 297
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 0

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    // Add new pages if the content is longer than one page
    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    pdf.save(`${filename}.pdf`)
    return true
  } catch (error) {
    console.error("Error generating PDF:", error)
    return false
  }
}

export async function exportTaskToPdf(taskId: string, taskTitle: string) {
  return exportToPdf("task-details-container", `task-${taskId}-${taskTitle.replace(/\s+/g, "-").toLowerCase()}`)
}

export async function exportReportToPdf(reportName: string) {
  return exportToPdf("report-container", `report-${reportName.replace(/\s+/g, "-").toLowerCase()}`)
}
