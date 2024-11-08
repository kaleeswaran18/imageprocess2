const Tesseract = require("tesseract.js");
const Card = require("../models/Card");
const fs = require("fs");
const sharp = require("sharp"); // For image preprocessing

// Function to parse OCR text output to extract relevant fields
const parseText = (text) => {
    const parsedData = {};
  
    // Clean up text for easier regex matching, preserving + and -
    let cleanedText = text
      .replace(/[^\w\s,.@+\-]/g, " ")  // Keep alphanumeric, space, comma, dot, @, +, and -
      .replace(/\s+/g, " ")            // Remove extra spaces
      .trim();
  console.log(cleanedText,'cleanedText')
    // Regular expressions to match different parts
    const nameRegex = /^[A-Za-z]+/; // Captures names starting with uppercase letters
    const jobTitleRegex = /\b(?:Manager|Executive|Engineer|Developer|Director|CEO|CTO|CFO|Consultant|Designer|Specialist|Owner|Founder|Sales|DATA MANAGER|Technical Manager)\b/i;
    //const address1Regex = /\d{1,5}\s+[A-Za-z0-9\s,.@-]+,\s*[A-Za-z\s]+,\s*[A-Za-z\s]*\d{5,6}/;
    
     const addressRegex = /\d+\s+[A-Za-z0-9\s,.#-]+,\s*[A-Za-z\s]+,\s*\d+\s*[A-Za-z]+\s*\d{5,7}/;
    const address2Regex = /\d+\s+[A-Za-z0-9\s,.#-]+,\s*[A-Za-z\s]+,\s*[A-Za-z\s]+\s*[A-Za-z]+\s*\d{5,6}/;
    const phoneRegex = /\+?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,4}/g; // Refined phone number regex
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/i;
   const emailRegex1 = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+/;
    const websiteRegex = /\b(?:www\.)?([A-Za-z0-9.-]+\.[A-Za-z]{2,})\b/i;
    const websit1eRegex =/www\.[A-Za-z0-9-]+\.[A-Za-z]+/
  
    // Match name first and remove job title if present
    const nameMatch = cleanedText.match(nameRegex);
    if (nameMatch) {
      parsedData.name = nameMatch[0].trim();
      // Remove the name from the cleanedText to parse the job title separately
      cleanedText = cleanedText.replace(parsedData.name, "").trim();
    }
  
    const jobTitleMatch = cleanedText.match(jobTitleRegex);
    if (jobTitleMatch) {
      parsedData.jobTitle = jobTitleMatch[0].trim();
    }
  
    let addressMatch = cleanedText.match(addressRegex)||cleanedText.match(address2Regex);
    console.log(addressMatch,'addressMatch')
    if(addressMatch==null){
      addressMatch = cleanedText.match(/\d{1,5}\s+[A-Za-z0-9\s,.@-]+,\s*[A-Za-z\s]+,\s*[A-Za-z\s]*\d{5,6}/)
      
    }
    if (addressMatch) parsedData.address = addressMatch[0].trim();
  
    // Handle phone numbers more precisely
    const phoneMatches = cleanedText.match(phoneRegex);
    if (phoneMatches) {
      // Filter out any unwanted numbers like "641603 0"
      parsedData.phone = phoneMatches.find((phone) => phone.includes("-") || phone.includes("+"))?.trim();  // Select only phone numbers with hyphen or plus
    }
  
    const emailMatch = cleanedText.match(emailRegex)||cleanedText.match(emailRegex1);
    if (emailMatch) parsedData.email = emailMatch[0].trim();
  
    const websiteMatch = cleanedText.match(websiteRegex)||cleanedText.match(websit1eRegex);
    if (websiteMatch) parsedData.website = websiteMatch[1].trim();
  
    return parsedData;
  };
  
 
  
  
  
  

// Preprocess the image to improve OCR accuracy
const preprocessImage = async (inputPath, outputPath) => {
  await sharp(inputPath)
    .grayscale() // Convert to grayscale
    .sharpen() // Apply sharpening to improve text clarity
    .resize(1000) // Resize to standardize image dimensions (increase if needed for better OCR)
    .toFile(outputPath);
};

// Upload and process visiting card image
exports.uploadCard = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const imagePath = req.file.path;
    const processedImagePath = "processed_" + req.file.filename;

    // Preprocess image
    await preprocessImage(imagePath, processedImagePath);

    // Process OCR on preprocessed image
    const result = await Tesseract.recognize(processedImagePath, "eng", {
      logger: (m) => console.log(m), // Show progress for debugging
    });
    console.log("OCR Result:", result.data.text);

    // Parse the OCR text
    const parsedData = parseText(result.data.text);
    console.log("Parsed Data:", parsedData);

    // Save parsed data to DB
    const newCard = new Card(parsedData);
    await newCard.save();
    console.log("Saved Card:", newCard);
      console.log("1")
    // Clean up files after processing
    fs.unlinkSync(imagePath);
    fs.unlinkSync(processedImagePath);
    console.log("2")
    // Respond with parsed data
    res.status(200).send({                
      msg: "New user registered successfully!",
      data: newCard
  })
  } catch (error) {
    console.error("Error processing image:", error);
    res.status(500).json({ error: "Failed to process the image" });
  }
};

// Get stored card data with pagination
exports.getCards = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const cards = await Card.find()
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    const count = await Card.countDocuments();

    res.json({
      cards,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error retrieving records:", error);
    res.status(500).json({ error: "Failed to retrieve records" });
  }
};
