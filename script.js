function simulate() {
  const requests = document.getElementById("requests").value.split(',').map(Number).filter(n => !isNaN(n));
  const head = parseInt(document.getElementById("head").value);
  const algo = document.getElementById("algorithm").value;
  const direction = document.getElementById("direction").value;

  if (requests.length === 0 || isNaN(head)) {
    document.getElementById("output").innerHTML = "<p>Please enter valid input.</p>";
    return;
  }

  let sequence = [];
  let seekTime = 0;

  switch (algo) {
    case "fcfs":
      ({ sequence, seekTime } = fcfs(requests, head));
      displayResult("First Come First Serve (FCFS)", sequence, seekTime, head);
      break;
    case "scan":
      ({ sequence, seekTime } = scan(requests, head, direction));
      displayResult("SCAN", sequence, seekTime, head);
      break;
    case "look":
      ({ sequence, seekTime } = look(requests, head, direction));
      displayResult("LOOK", sequence, seekTime, head);
      break;
    case "cscan":
      ({ sequence, seekTime } = cscan(requests, head));
      displayResult("C-SCAN", sequence, seekTime, head);
      break;
    case "clook":
      ({ sequence, seekTime } = clook(requests, head));
      displayResult("C-LOOK", sequence, seekTime, head);
      break;
  }  

  document.getElementById("output").innerHTML =
    `<div class="result-box"><h2>Seek Sequence:</h2><p>${sequence.join(" → ")}</p><h2>Total Seek Time:</h2><p>${seekTime}</p></div>`;
}

// ================= Algorithms =================

function fcfs(requests, head) {
  let sequence = [];
  let seekTime = 0;
  let current = head;

  for (let req of requests) {
    seekTime += Math.abs(req - current);
    sequence.push(req);
    current = req;
  }

  return { sequence, seekTime };
}

function scan(requests, head, direction) {
  let sequence = [];
  let seekTime = 0;
  let left = [], right = [];
  let current = head;

  for (let r of requests) {
    if (r < head) left.push(r);
    else right.push(r);
  }

  left.sort((a, b) => a - b);
  right.sort((a, b) => a - b);

  if (direction === "left") {
    for (let i = left.length - 1; i >= 0; i--) {
      seekTime += Math.abs(current - left[i]);
      current = left[i];
      sequence.push(current);
    }
    if (right.length > 0) {
      seekTime += Math.abs(current - 0);
      current = 0;
      for (let r of right) {
        seekTime += Math.abs(current - r);
        current = r;
        sequence.push(current);
      }
    }
  } else {
    for (let r of right) {
      seekTime += Math.abs(current - r);
      current = r;
      sequence.push(current);
    }
    if (left.length > 0) {
      seekTime += Math.abs(current - 199);
      current = 199;
      for (let i = left.length - 1; i >= 0; i--) {
        seekTime += Math.abs(current - left[i]);
        current = left[i];
        sequence.push(current);
      }
    }
  }

  return { sequence, seekTime };
}

function look(requests, head, direction) {
  let sequence = [];
  let seekTime = 0;
  let left = [], right = [];
  let current = head;

  for (let r of requests) {
    if (r < head) left.push(r);
    else right.push(r);
  }

  left.sort((a, b) => a - b);
  right.sort((a, b) => a - b);

  if (direction === "left") {
    for (let i = left.length - 1; i >= 0; i--) {
      seekTime += Math.abs(current - left[i]);
      current = left[i];
      sequence.push(current);
    }
    for (let r of right) {
      seekTime += Math.abs(current - r);
      current = r;
      sequence.push(current);
    }
  } else {
    for (let r of right) {
      seekTime += Math.abs(current - r);
      current = r;
      sequence.push(current);
    }
    for (let i = left.length - 1; i >= 0; i--) {
      seekTime += Math.abs(current - left[i]);
      current = left[i];
      sequence.push(current);
    }
  }

  return { sequence, seekTime };
}

function cscan(requests, head) {
  let sequence = [];
  let seekTime = 0;
  let current = head;
  let left = [], right = [];

  for (let r of requests) {
    if (r < head) left.push(r);
    else right.push(r);
  }

  left.sort((a, b) => a - b);
  right.sort((a, b) => a - b);

  for (let r of right) {
    seekTime += Math.abs(current - r);
    current = r;
    sequence.push(current);
  }

  // Go to end then jump to start
  if (left.length > 0) {
    seekTime += Math.abs(current - 199); // End
    seekTime += 199; // Jump to 0
    current = 0;

    for (let r of left) {
      seekTime += Math.abs(current - r);
      current = r;
      sequence.push(current);
    }
  }

  return { sequence, seekTime };
}

function clook(requests, head) {
  let sequence = [];
  let seekTime = 0;
  let current = head;
  let left = [], right = [];

  for (let r of requests) {
    if (r < head) left.push(r);
    else right.push(r);
  }

  left.sort((a, b) => a - b);
  right.sort((a, b) => a - b);

  for (let r of right) {
    seekTime += Math.abs(current - r);
    current = r;
    sequence.push(current);
  }

  if (left.length > 0) {
    seekTime += Math.abs(current - left[0]);
    current = left[0];

    for (let i = 0; i < left.length; i++) {
      if (i !== 0) {
        seekTime += Math.abs(current - left[i]);
        current = left[i];
      }
      sequence.push(current);
    }
  }

  return { sequence, seekTime };
}

document.getElementById("theme-toggle").addEventListener("change", function () {
  document.body.classList.toggle("dark-mode");
});

function displayResult(algorithmName, sequence, seekTime, head) {
  const output = document.getElementById("output");
  output.innerHTML = `
    <div class="result-box">
      <h2>${algorithmName}</h2>
      <p><strong>Seek Sequence:</strong> ${sequence.join(" → ")}</p>
      <p><strong>Total Seek Time:</strong> ${seekTime}</p>
    </div>
  `;
  drawChart([head, ...sequence]);
}

function drawChart(sequence) {
  const ctx = document.getElementById('chart').getContext('2d');
  if (window.seekChart) {
    window.seekChart.destroy(); // clear previous chart if any
  }

  window.seekChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: sequence.map((_, i) => i), // simple index for x-axis
      datasets: [{
        label: 'Disk Head Movement',
        data: sequence,
        borderColor: '#4CAF50',
        tension: 0.3,
        pointBackgroundColor: '#4CAF50',
        fill: false
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: context => `Cylinder: ${context.parsed.y}`
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Step'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Cylinder Number'
          },
          beginAtZero: true
        }
      }
    }
  });
}