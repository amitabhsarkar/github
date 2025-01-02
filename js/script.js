document.addEventListener("DOMContentLoaded", function () {
  console.log("Initializing calendar generator...");

  const yearSelect = document.getElementById("year");
  const monthSelect = document.getElementById("month");
  const calendarContainer = document.getElementById("calendar-container");
  const downloadPngBtn = document.getElementById("download-png");
  const downloadJpgBtn = document.getElementById("download-jpg");
  const downloadPdfBtn = document.getElementById("download-pdf");

  if (!yearSelect || !monthSelect || !calendarContainer) {
    console.error(
      "One or more essential elements are missing in the HTML structure."
    );
    return;
  }

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const today = new Date();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Populate year dropdown
  function populateYearDropdown() {
    yearSelect.innerHTML = ""; // Clear existing options
    for (let i = currentYear - 50; i <= currentYear + 50; i++) {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = i;
      yearSelect.appendChild(option);
    }
    console.log("Year dropdown populated successfully.", yearSelect.innerHTML);
  }

  populateYearDropdown();

  monthSelect.value = currentMonth;

  // Generate calendar
  function generateCalendar(year, month) {
    calendarContainer.innerHTML = "";

    // Add the calendar heading
    const header = document.createElement("div");
    header.classList.add("calendar-header");
    header.textContent = `${monthNames[month]} ${year}`;
    calendarContainer.appendChild(header);

    // Create the calendar table
    const table = document.createElement("table");
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const headerRow = document.createElement("tr");
    days.forEach((day) => {
      const th = document.createElement("th");
      th.textContent = day;
      headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let date = 1;
    for (let i = 0; i < 6; i++) {
      const row = document.createElement("tr");
      for (let j = 0; j < 7; j++) {
        const cell = document.createElement("td");
        if (i === 0 && j < firstDay) {
          cell.textContent = "";
        } else if (date > daysInMonth) {
          break;
        } else {
          cell.textContent = date;
          if (
            year === today.getFullYear() &&
            month === today.getMonth() &&
            date === today.getDate()
          ) {
            cell.classList.add("today");
          }
          date++;
        }
        row.appendChild(cell);
      }
      table.appendChild(row);
    }
    calendarContainer.appendChild(table);
    // Add a footer with a link to affectiontag.com
    const footer = document.createElement("div");
    footer.classList.add("calendar-footer");
    const footerLink = document.createElement("a");
    footerLink.href = "https://affectiontag.com";
    footerLink.textContent = "AffectionTag.com";
    footer.appendChild(footerLink);
    calendarContainer.appendChild(footer);
  }

  console.log("Generating calendar for current year and month...");
  yearSelect.value = currentYear;
  monthSelect.value = currentMonth;
  console.log(
    "Dropdown values - Year:",
    yearSelect.value,
    "Month:",
    monthSelect.value
  );
  generateCalendar(currentYear, currentMonth);

  document
    .getElementById("calendar-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      const year = parseInt(yearSelect.value, 10);
      const month = parseInt(monthSelect.value, 10);

      if (isNaN(year) || isNaN(month)) {
        console.error("Invalid year or month value.");
        return;
      }

      console.log(`Generating calendar for Year: ${year}, Month: ${month}`);
      generateCalendar(year, month);
    });

  function addExifData(base64Image, description, artist, copyright, keywords) {
    if (!base64Image.startsWith("data:image/jpeg;base64,")) {
      console.error("EXIF can only be added to valid JPEG images.");
      return base64Image; // Skip EXIF modification for unsupported formats
    }

    const exifData = {
      "0th": {
        [piexif.ImageIFD.ImageDescription]: description,
        [piexif.ImageIFD.Artist]: artist,
        [piexif.ImageIFD.Copyright]: copyright,
        [piexif.ImageIFD.XPKeywords]: keywords,
        [piexif.ImageIFD.XPComment]: "https://affectiontag.com",
      },
    };

    try {
      const exifBytes = piexif.dump(exifData);
      return piexif.insert(exifBytes, base64Image);
    } catch (error) {
      console.error("Failed to add EXIF data:", error);
      return base64Image; // Return the unmodified image if EXIF fails
    }
  }

  function downloadImage(format) {
    html2canvas(calendarContainer, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
    }).then((canvas) => {
      let imageData = canvas.toDataURL(`image/${format}`, 1.0);
      const description = `${monthNames[parseInt(monthSelect.value)]} ${
        yearSelect.value
      } Calendar by Affectiontag.com`;
      const artist = "Affectiontag.com";
      const copyright = `© ${yearSelect.value} Affectiontag.com. All rights reserved.`;
      const keywords = `calendar, ${monthNames[parseInt(monthSelect.value)]} ${
        yearSelect.value
      }, free printable calendar, Affectiontag.com`;

      if (format === "jpeg") {
        imageData = addExifData(
          imageData,
          description,
          artist,
          copyright,
          keywords
        );
      }

      const link = document.createElement("a");
      const fileName = `${monthNames[parseInt(monthSelect.value)]}-${
        yearSelect.value
      }-affectiontag.com.${format}`;
      link.download = fileName;
      link.href = imageData;
      link.click();
    });
  }

  downloadPngBtn.addEventListener("click", () => downloadImage("png"));
  downloadJpgBtn.addEventListener("click", () => downloadImage("jpeg"));

  downloadPdfBtn.addEventListener("click", function () {
    try {
      html2canvas(calendarContainer, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      }).then((canvas) => {
        const pdf = new jspdf.jsPDF();
        const imgData = canvas.toDataURL("image/png");
        pdf.addImage(imgData, "PNG", 10, 10, 190, 0);
        pdf.textWithLink("Visit affectiontag.com", 10, 280, {
          url: "https://affectiontag.com",
        });
        pdf.save(
          `${monthNames[parseInt(monthSelect.value)]}-${
            yearSelect.value
          }-affectiontag.com.pdf`
        );
      });
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    }
  });
});
