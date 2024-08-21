$(document).ready(function () {
  const form = $("#multiStepForm");
  const steps = form.find(".form-step");
  const nextBtns = form.find(".next-step");
  const prevBtns = form.find(".prev-step");

  // Summary elements
  const summaryName = $("#summaryName");
  const summaryDate = $("#summaryDate");
  const summaryTimeSlot = $("#summaryTimeSlot");
  const summaryPhone = $("#summaryPhone");

  let currentStep = 0;
  let selectedDate = null;
  let selectedTimeSlot = null;

  // Sample time slots data
  let timeSlots = {
    workerone: {
      "2024-08-13": [
        { time: "09:00am - 11am", available: true },
        { time: "11:00am - 01pm", available: false },
        { time: "02:00pm - 04pm", available: true },
      ],
      "2024-08-14": [
        { time: "09:00am - 11am", available: true },
        { time: "11:00am - 01pm", available: true },
        { time: "02:00pm - 04pm", available: true },
      ],
      "2024-08-15": [
        { time: "09:00am - 11am", available: false },
        { time: "11:00am - 01pm", available: false },
        { time: "02:00pm - 04pm", available: false },
      ],
    },
    workertwo: {
      "2024-08-13": [
        { time: "09:00am - 11am", available: true },
        { time: "11:00am - 01pm", available: true },
        { time: "02:00pm - 04pm", available: true },
      ],
      "2024-08-14": [
        { time: "09:00am - 11am", available: false },
        { time: "11:00am - 01pm", available: false },
        { time: "02:00pm - 04pm", available: false },
      ],
      "2024-08-15": [
        { time: "09:00am - 11am", available: true },
        { time: "11:00am - 01pm", available: false },
        { time: "02:00pm - 04pm", available: true },
      ],
    },
  };

  // FullCalendar configuration
  const calendar = $("#calendar").fullCalendar({
    header: {
      left: "prev,next today",
      center: "title",
      right: "", // Removed other views
    },
    defaultView: "month",
    selectable: true,
    selectHelper: true,
    dateClick: function (info) {
      const formattedDate = info.date.format("YYYY-MM-DD");
      const worker = form.find('input[name="worker"]:checked').val();

      if (timeSlots[worker] && timeSlots[worker][formattedDate]) {
        selectedDate = formattedDate;
        $(".selected-date").text("Selected Date: " + selectedDate);
        updateSummaryDate();
        displayTimeSlots();
        $("#nextStepBtn").hide(); // Hide the button until a time slot is selected
      } else {
        alert("No available slots on this date.");
      }
    },
    events: function (info, successCallback, failureCallback) {
      const worker = form.find('input[name="worker"]:checked').val();
      const events = [];

      if (timeSlots[worker]) {
        for (const date in timeSlots[worker]) {
          const slots = timeSlots[worker][date];
          const available = slots.some((slot) => slot.available);

          events.push({
            title: available ? "Available" : "Unavailable",
            start: date,
            classNames: available ? "available-date" : "unavailable-date",
            display: "background",
          });
        }
      }
    },
  });

  function updateSummaryDate() {
    summaryDate.text(selectedDate || "No date selected");
  }

  function displayTimeSlots() {
    const worker = form.find('input[name="worker"]:checked').val();
    const timeSlotsForSelectedDate = timeSlots[worker][selectedDate];
    const timeSlotsDiv = $(".time-slots");
    timeSlotsDiv.empty();

    timeSlotsForSelectedDate.forEach((slot) => {
      const slotDiv = $("<div></div>")
        .text(slot.time)
        .addClass(slot.available ? "available" : "unavailable");

      if (slot.available) {
        slotDiv.on("click", function () {
          $(".time-slots div").removeClass("selected");
          $(this).addClass("selected");
          selectedTimeSlot = slot.time;
          updateSummaryTimeSlot();
          $("#nextStepBtn").show(); // Show the button when a slot is selected
        });
      }

      timeSlotsDiv.append(slotDiv);
    });
  }

  function updateSummaryTimeSlot() {
    summaryTimeSlot.text(selectedTimeSlot || "No time slot selected");
  }

  // Next step button click handler
  nextBtns.click(function () {
    if (currentStep === 0) {
      // Save selected worker name
      const selectedWorkerName = form
        .find('input[name="worker"]:checked')
        .next("label")
        .text();
      summaryName.text(selectedWorkerName);
    } else if (currentStep === 2) {
      // Save phone number
      summaryPhone.text(form.find("#phone").val());
    }

    if (currentStep < steps.length - 1) {
      $(steps[currentStep])
        .removeClass("form-step-active")
        .addClass("form-step-hidden");
      currentStep++;
      $(steps[currentStep])
        .removeClass("form-step-hidden")
        .addClass("form-step-active");
    }
  });

  // Previous step button click handler
  prevBtns.click(function () {
    if (currentStep > 0) {
      $(steps[currentStep])
        .removeClass("form-step-active")
        .addClass("form-step-hidden");
      currentStep--;
      $(steps[currentStep])
        .removeClass("form-step-hidden")
        .addClass("form-step-active");
    }
  });

  // Form submit handler
  form.submit(function (e) {
    e.preventDefault();
    alert("Form submitted successfully!");
  });
});
