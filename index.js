let fileRef = document.getElementById("file");
let outputFiles = document.getElementById("output");


const convertCSVToArr = (csvTxt, delimiter = ",") => {
  // define static header
  const headers = ["id", "area", "name", "quantity", "brand"];

  // convert string to array based on break line
  const rows = csvTxt.split("\n");

  const arr = rows.map(sLine => {
    const values = sLine.split(delimiter);
    console.log({values})
    // return object of each order with it's details
    const sOrder = headers.reduce((accumulatorObj, header, i) => {
      accumulatorObj[header] = values[i].replace(/[\r]/gm, "");
      return accumulatorObj;
    }, {});
    return sOrder;
  });

  return arr;
};

/// utilities
const groupByKey = (arr = [], key = "name") => {
    let tempGroup = {};
  
    arr.forEach(order => {
      tempGroup[order[key]] = tempGroup[order[key]] ?? [];
      tempGroup[order[key]].push(order);
    });
  
    return tempGroup;
  };

const getRepeatedBrand = (arr = []) => {
  let repeated = {
    max: 0,
    brand: ""
  };
  const groupedObject = groupByKey(arr, "brand");

  Object.keys(groupedObject).map(key => {
    if (repeated.max < groupedObject[key].length) {
      repeated.max = groupedObject[key].length;
      repeated.brand = key;
    }
  });

  return repeated.brand;
};

const getAvgPerOrder = (grouppedOrders, totalOrders) => {
  let average = {};

  Object.keys(grouppedOrders).map(key => {
    average[key] = {};
    average[key].brand = getRepeatedBrand(grouppedOrders[key]);

    const total = grouppedOrders[key].reduce(
      (prev, current) => +current.quantity + prev,
      0
    );
    average[key].total = total / totalOrders;
  });

  return average;
};

const generateCSVFile = (
  grouppedData = {},
  fileName = "file name",
  attr = ""
) => {
  let rows = [];

  Object.keys(grouppedData).map(key => {
    rows.push([key, grouppedData[key][attr]]);
  });

  let csvContent =
    "data:text/csv;charset=utf-8," +
    rows.map(line => line.join()).join("\n");
  var encodedUri = encodeURI(csvContent);

  var link = document.createElement("a");
  link.innerText = fileName;
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", fileName);

  output.appendChild(link);
};

// start Point
fileRef.onchange = (event) => {
  let file = event.target.files[0];
  const fileReader = new FileReader();

  fileReader.onload = (event) => {
    outputFiles.innerHTML = "";
    const csvText = event.target.result;
    const csvDataArray = convertCSVToArr(csvText);
    const groupedAndAverageCalc = getAvgPerOrder(
      groupByKey(csvDataArray),
      csvDataArray.length
    );

    // get Generated Files
    generateCSVFile(groupedAndAverageCalc, `0_${file.name}`, "total");
    generateCSVFile(groupedAndAverageCalc, `1_${file.name}`, "brand");
  };
  fileReader.readAsText(file);
};