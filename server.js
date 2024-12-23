const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const { ObjectId } = require('mongodb');
const cors = require("cors");
const FormData = require('form-data');

app.use(express.json());
app.use(cors());



const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const bcrypt = require('bcrypt');

const userSchema2 = new mongoose.Schema({
  url: String,
  name: String,
  email: String,
  password: String
});
const Gameuser2 = new mongoose.model("Gameuser2", userSchema2);








//Routes
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Gameuser2.findOne({ email: email });

    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        const objectId = user._id.toString();
        res.status(200).json({ message: 'Login successful', objectId: objectId });
      } else {
        res.status(401).json({ message: 'Invalid password' });
      }
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }

});




const multer = require('multer');

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/api/register', upload.single('image'), async (req, res) => {
  const formData = new FormData();
  const { default: fetch } = await import('node-fetch');
  formData.append('image', req.file.buffer.toString('base64'));

  const response = await fetch('https://api.imgbb.com/1/upload?key=368cbdb895c5bed277d50d216adbfa52', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  const imageUrl = data.data.url;
  const { name, email, password } = req.body; // Destructure title and text from req.body


  try {
    const existingUser = await Gameuser2.findOne({ email: email });

    if (existingUser) {
      res.status(409).json({ message: 'User already exists' });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

      const newUser = new Gameuser2({
        url: imageUrl,
        name: name,
        email: email,
        password: hashedPassword,
       
      });

      await newUser.save();
      res.status(200).json({ message: 'Registration successful', userName: name , userEmail: email });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});



// API endpoint to retrieve all user data by name
app.get('/api/user/:name', async (req, res) => {
  const { name } = req.params;

  try {
    const user = await Gameuser2.findOne({ name });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user); // Send all user data
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Delete a user by ObjectId
app.delete('/api/userToDelete/:objectId', async (req, res) => {
  const { objectId } = req.params;

  try {
    const deletedUser = await Gameuser2.findByIdAndDelete(objectId);

    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/users/:objectId', async (req, res) => {
  const { objectId } = req.params;

  try {
    const user = await Gameuser2.findById(objectId);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// API endpoint to fetch all user data
app.get('/api/get-users', async (req, res) => {
  try {
    const users = await Gameuser2.find({});
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user data' });
  }
});




//Routes for games users end here




app.put('/api/updateUser/:id', async (req, res) => {
  const { id } = req.params;
  const { email, name, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

  try {
      const fighter = await Gameuser2.findByIdAndUpdate(id, { email, name, password:hashedPassword }, { new: true });

      if (!fighter) {
          return res.status(404).json({ message: 'Fighter not found' });
      }

      res.status(200).json({ message: 'Profile updated successfully', fighter });
  } catch (error) {
      console.error('Error updating:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});




app.post("/submit-welcome-note", (req, res) => {
  // Extract the form data from the request body
  const {  userName , userEmail} = req.body;
  console.log(userEmail);
  console.log(userName);
  console.log("test");

  // Send an email with the form details using Nodemailer or your preferred email library
  // Here's an example using Nodemailer
  const nodemailer = require("nodemailer");

// Create a transporter object for sending the email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'vascularbundle43@gmail.com',
    pass: 'gxauudkzvdvhdzbg',
  },
});

const storeMailOptions = {
  from: userEmail,
  to: "vascularbundle43@gmail.com",
  subject: "AI Emocare",
  html: `
    <h2 style="color: #ff523b;">AI Emocare</h2>
    <hr style="border: 1px solid #ccc;">
    <p>Another user added</p>
  `,
};

const userMailOptions = {
  from: "wajih786hassan@gmail.com",
  to: userEmail,
  subject: "AI Emocare",
  html: `
  <h2 style="color: red;">Welcome to AI Emocare</h2>
  <p>Hello ${userName},</p>
  <p>Thank you for signing up for AI Emocare! </p>
  
  <p>If you have any questions or need assistance, don't hesitate to reach out to our support team at support@emocare.com.</p>
  <p>Once again, welcome to AI Emocare, ${userName}! </p>
  <p>Best regards,</p>
  <p>The AI Emocare Team</p> 
  `,
};

// Send the email to the store
transporter.sendMail(storeMailOptions, function(error, storeInfo) {
  if (error) {
    console.error(error);
    res.status(500).send("Error sending email to store");
  } else {
    console.log("Email sent to store: " + storeInfo.response);

    // Send the email to the user
    transporter.sendMail(userMailOptions, function(error, userInfo) {
      if (error) {
        console.error(error);
        res.status(500).send("Error sending email to user");
      } else {
        console.log("Email sent to user: " + userInfo.response);
        res.status(200).send("Order submitted successfully");
      }
    });
  }
});

});



//code for blogs start



const forumSchemaNew = new mongoose.Schema({
  name: String,
  text: String,
  forumDate: Date
});

const Forumfyp = mongoose.model('Forumfyp', forumSchemaNew);

app.post('/uploadforum', async (req, res) => {
  
  const {  name, text, forumDate } = req.body; // Destructure title and text from req.body

  // Save the image URL, title, and text to the database
  const newBlog = new Forumfyp({ name:name, text:text, forumDate:forumDate });
  await newBlog.save();
  res.status(200).send('Blog uploaded successfully');
});



// Define route for fetching images
app.get('/myForums', async (req, res) => {
  const images = await Forumfyp.find();
  res.send(images);
});

//code for blogs end




//code for contact form thilina


app.post("/send-data-thilina", (req, res) => {
  
  const {  name , email , message, subject} = req.body;
  console.log(name);
  
  const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'lmtdhananjaya@gmail.com',
    pass: 'qzyobcedmzktjhle',
  },
});

const storeMailOptions = {
  from: email,
  to: "lmtdhananjaya@gmail.com",
  subject: `Message from ${name}:${subject}`,
  html: `
  <center>
  <div style="width:80px; height:80px;border-radius:50%; display:flex; 
  padding: 5px;
justify-content:center;
align-items:center; overflow:hidden;
margin-bottom: 20px;  border: 4px solid #379f00;
">
  <img src="https://i.ibb.co/hDBWQVv/myimg.png" alt="two" border="0" style=" 
  width:100%; aspect-ratio:1; object-fit:cover; border-radius:50%;">
  </div></center>
   
  <center><h2 style="color: #3A3A3A; font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; margin-bottom: 20px;">Great News!</h2></center>
  <center><h2 style="color: #3A3A3A; font-family: Arial, sans-serif; font-size: 18px; margin-bottom: 10px;"><span style="color: #379f00;">You have received a message from ${name}</span></h2></center>
  <hr style="border: 0.5px solid black;">
  <center><h3 style="color: #3A3A3A; font-family: Arial, sans-serif; font-size: 16px; margin-bottom: 10px;">Message</h3></center>
  <p style="color: #3A3A3A; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5; margin-bottom: 10px;">${message}</p>
  <p style="color: #3A3A3A; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5; margin-top: 10px;">Contact: ${email}</p>

    
    `,
};
const userMailOptions = {
  from: "lmtdhananjaya@gmail.com",
  to: email,
  subject: "Thilina Dhananjaya",
  html: `
  <center>
  <div style="width:80px; height:80px;border-radius:50%; display:flex; 
  padding: 5px;
justify-content:center;
align-items:center; overflow:hidden;
margin-bottom: 20px;  border: 4px solid #379f00;
">
  <img src="https://i.ibb.co/hDBWQVv/myimg.png" alt="two" border="0" style=" 
  width:100%; aspect-ratio:1; object-fit:cover; border-radius:50%;">
  </div></center>
   
  <center><h2 style="color: #3A3A3A; font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; margin-bottom: 20px;">Thank You, <span style="color: #379f00;">${name}</span>!</h2></center>
  <p style="color: #3A3A3A; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5; margin-bottom: 10px;">Your query:</p>
  <p style="color: #3A3A3A; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5; margin-bottom: 10px;">${message}</p>
  <p style="color: #3A3A3A; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5;">Your email has been received. Thank you for contacting Thilina Dhananjaya!</p>

    `
};

// Send the email to the store
transporter.sendMail(storeMailOptions, function(error, storeInfo) {
  if (error) {
    console.error(error);
    res.status(500).send("Error sending email to store");
  } else {
    console.log("Email sent to store: " + storeInfo.response);

    // Send the email to the user
    transporter.sendMail(userMailOptions, function(error, userInfo) {
      if (error) {
        console.error(error);
        res.status(500).send("Error sending email to user");
      } else {
        console.log("Email sent to user: " + userInfo.response);
        res.status(200).send("Order submitted successfully");
      }
    });
  }
});

});
















const conversationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  date: { type: String, required: true },
  conversations: [
    {
      sender: { type: String, required: true, enum: ['user', 'chatbot'] },
      message: { type: String, required: true }
    }
  ]
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const Conversation = mongoose.model('Conversation', conversationSchema);

app.post('/messages', async (req, res) => {
  const { userId, message, sender } = req.body;
  const today = new Date().toISOString().slice(0, 10); // format YYYY-MM-DD

  try {
    let conversation = await Conversation.findOne({ userId, date: today });

    if (!conversation) {
      conversation = new Conversation({
        userId,
        date: today,
        conversations: []
      });
    }

    conversation.conversations.push({ sender, message });
    await conversation.save();

    res.status(201).json({
      status: 'success',
      data: {
        message: 'Message added successfully'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to store message'
    });
  }
});






app.get('/messages/:userId', async (req, res) => {
    const { userId } = req.params;
  
  try {
    const conversations = await Conversation.find({ userId }).sort('date'); // Retrieves all conversations for the user and sorts them by date

    if (!conversations.length) {
      return res.status(404).json({
        status: 'error',
        message: 'No conversations found for this user'
      });
    }

    res.status(200).json({
      status: 'success',
      data: conversations.map(conv => ({
        date: conv.date,
        conversations: conv.conversations
      }))
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve messages'
    });
  }
});



// Define route for fetching images
app.get('/mymessages', async (req, res) => {
  const images = await Conversation.find();
  res.send(images);
});




// code for model website sending emails form


app.post("/send-data-modal", (req, res) => {
  
  const {  name , email , message} = req.body;
  console.log(name);
  
  const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'phoebechok1411@gmail.com',
    pass: 'jfxluqtdvsekaxar',
  },
});

const storeMailOptions = {
  from: email,
  to: "phoebechok1411@gmail.com",
  subject: `Message from ${name}`,
  html: `
    <center><h2 style="color: #c8a97e;">Great News! <br> <span style="color:#212529">You have received a message from ${name}</span></h2></center>
    <hr style="border: 2px solid #c8a97e;">
    <center><h3>Message</h3></center>
    <p> ${message}</p>
    <p style="margin-top:10px;">Contact: ${email}</p>
    
    
    `,
};
const userMailOptions = {
  from: "phoebechok1411@gmail.com",
  to: email,
  subject: "Phoebe Chok",
  html: `
    <center><h2>Thanks <span style="color: #c8a97e;">${name}</span> for reaching out to me.<br><br> </h2></center>
    <p>Here is your message:</p>
    <p> ${message}</p>
    
    <p>Your email has been received. Thank you for choosing me! <br> Phoebe Chock, <br> Model</p>
  
    `
};

// Send the email to the store
transporter.sendMail(storeMailOptions, function(error, storeInfo) {
  if (error) {
    console.error(error);
    res.status(500).send("Error sending email to store");
  } else {
    console.log("Email sent to store: " + storeInfo.response);

    // Send the email to the user
    transporter.sendMail(userMailOptions, function(error, userInfo) {
      if (error) {
        console.error(error);
        res.status(500).send("Error sending email to user");
      } else {
        console.log("Email sent to user: " + userInfo.response);
        res.status(200).send("Order submitted successfully");
      }
    });
  }
});

});












// code for tejassvi website sending emails form


app.post("/send-data-emocare", (req, res) => {
  
  const {  name , email , message, subject} = req.body;
  const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'vascularbundle43@gmail.com',
    pass: 'gxauudkzvdvhdzbg',
  },
});

const storeMailOptions = {
  from: email,
  to: "vascularbundle43@gmail.com",
  subject: `Message from ${name}:${subject}`,
  html: `
  <center><img src="https://i.ibb.co/DrY2m5T/IMG-20240516-WA0001.jpg" alt="two" border="0" style=" margin-bottom: 20px; width:70px;
  border-radius: 50%;
  padding:5px;
  border: 2px solid #149ddd;"></center>
   
  <center><h2 style="color: #3A3A3A; font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; margin-bottom: 20px;">Great News!</h2></center>
  <center><h2 style="color: #3A3A3A; font-family: Arial, sans-serif; font-size: 18px; margin-bottom: 10px;"><span style="color: #149ddd;">You have received a message from ${name}</span></h2></center>
  <hr style="border: 0.5px solid black;">
  <center><h3 style="color: #3A3A3A; font-family: Arial, sans-serif; font-size: 16px; margin-bottom: 10px;">Message</h3></center>
  <p style="color: #3A3A3A; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5; margin-bottom: 10px;">${message}</p>
  <p style="color: #3A3A3A; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5; margin-top: 10px;">Contact: ${email}</p>

    
    `,
};
const userMailOptions = {
  from: "vascularbundle43@gmail.com",
  to: email,
  subject: "AI Emocare",
  html: `
  <center><img src="https://i.ibb.co/DrY2m5T/IMG-20240516-WA0001.jpg" alt="two" border="0" style=" margin-bottom: 20px; width:70px;
  border-radius: 50%;
  padding:5px;
  border: 2px solid #149ddd;"></center>
   
  <center><h2 style="color: #3A3A3A; font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; margin-bottom: 20px;">Thank You, <span style="color: #149ddd;">${name}</span>!</h2></center>
  <p style="color: #3A3A3A; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5; margin-bottom: 10px;">Your query:</p>
  <p style="color: #3A3A3A; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5; margin-bottom: 10px;">${message}</p>
  <p style="color: #3A3A3A; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5;">Your email has been received.Your query will be processed shortly! Thank you for contacting AI Emocare!</p>

    `
};

// Send the email to the store
transporter.sendMail(storeMailOptions, function(error, storeInfo) {
  if (error) {
    console.error(error);
    res.status(500).send("Error sending email to store");
  } else {
    console.log("Email sent to store: " + storeInfo.response);

    // Send the email to the user
    transporter.sendMail(userMailOptions, function(error, userInfo) {
      if (error) {
        console.error(error);
        res.status(500).send("Error sending email to user");
      } else {
        console.log("Email sent to user: " + userInfo.response);
        res.status(200).send("Order submitted successfully");
      }
    });
  }
});

});









app.post("/send-data-myportfolio", (req, res) => {
  
  const {  name , email , message, subject} = req.body;
  const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'vascularbundle43@gmail.com',
    pass: 'gxauudkzvdvhdzbg',
  },
});

const storeMailOptions = {
  from: email,
  to: "vascularbundle43@gmail.com",
  subject: `Message from ${name}:${subject}`,
  html: `
  <center><img src="https://i.ibb.co/9b9rkYZ/myimg.jpg" alt="two" border="0" style=" margin-bottom: 20px; width:70px;
  border-radius: 50%;
  padding:5px;
  border: 2px solid #149ddd;"></center>
   
  <center><h2 style="color: #3A3A3A; font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; margin-bottom: 20px;">Great News!</h2></center>
  <center><h2 style="color: #3A3A3A; font-family: Arial, sans-serif; font-size: 18px; margin-bottom: 10px;"><span style="color: #149ddd;">You have received a message from ${name}</span></h2></center>
  <hr style="border: 0.5px solid black;">
  <center><h3 style="color: #3A3A3A; font-family: Arial, sans-serif; font-size: 16px; margin-bottom: 10px;">Message</h3></center>
  <p style="color: #3A3A3A; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5; margin-bottom: 10px;">${message}</p>
  <p style="color: #3A3A3A; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5; margin-top: 10px;">Contact: ${email}</p>

    
    `,
};
const userMailOptions = {
  from: "vascularbundle43@gmail.com",
  to: email,
  subject: "Wajih ul Hassan",
  html: `
  <center><img src="https://i.ibb.co/9b9rkYZ/myimg.jpg" alt="two" border="0" style=" margin-bottom: 20px; width:70px;
  border-radius: 50%;
  padding:5px;
  border: 2px solid #149ddd;"></center>
   
  <center><h2 style="color: #3A3A3A; font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; margin-bottom: 20px;">Thank You, <span style="color: #149ddd;">${name}</span>!</h2></center>
  <p style="color: #3A3A3A; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5; margin-bottom: 10px;">Your query:</p>
  <p style="color: #3A3A3A; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5; margin-bottom: 10px;">${message}</p>
  <p style="color: #3A3A3A; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5;">Your email has been received. Your query will be processed shortly! Thank you for contacting me!</p>
  <p style="color: #3A3A3A; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5;">Best regards,<br>Wajih ul Hassan</p>
  `
};

// Send the email to the store
transporter.sendMail(storeMailOptions, function(error, storeInfo) {
  if (error) {
    console.error(error);
    res.status(500).send("Error sending email to store");
  } else {
    console.log("Email sent to store: " + storeInfo.response);

    // Send the email to the user
    transporter.sendMail(userMailOptions, function(error, userInfo) {
      if (error) {
        console.error(error);
        res.status(500).send("Error sending email to user");
      } else {
        console.log("Email sent to user: " + userInfo.response);
        res.status(200).send("Order submitted successfully");
      }
    });
  }
});

});




















app.post("/send-data-uinurkhanov", (req, res) => {
  
  const {  name , email , message, subject} = req.body;
  const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'vascularbundle43@gmail.com',
    pass: 'vlfvhlwuvhlryidd',
  },
});

const storeMailOptions = {
  from: email,
  to: "nurkhanov.u@gmail.com",
  subject: `Message from ${name}:${subject}`,
  html: `
  <center><img src="https://i.ibb.co/vkzr9Ty/ul-nurkh.png" alt="two" border="0" style=" margin-bottom: 20px; width:70px;
  border-radius: 50%;
  padding:5px;
  border: 2px solid #149ddd;"></center>
   
  <center><h2 style="color: #3A3A3A; font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; margin-bottom: 20px;">Great News!</h2></center>
  <center><h2 style="color: #3A3A3A; font-family: Arial, sans-serif; font-size: 18px; margin-bottom: 10px;"><span style="color: #149ddd;">You have received a message from ${name}</span></h2></center>
  <hr style="border: 0.5px solid black;">
  <center><h3 style="color: #3A3A3A; font-family: Arial, sans-serif; font-size: 16px; margin-bottom: 10px;">Message</h3></center>
  <p style="color: #3A3A3A; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5; margin-bottom: 10px;">${message}</p>
  <p style="color: #3A3A3A; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5; margin-top: 10px;">Contact: ${email}</p>

    
    `,
};
const userMailOptions = {
  from: "nurkhanov.u@gmail.com",
  to: email,
  subject: "Ul Nurkhanov",
  html: `
  <center><img src="https://i.ibb.co/vkzr9Ty/ul-nurkh.png" alt="two" border="0" style=" margin-bottom: 20px; width:70px;
  border-radius: 50%;
  padding:5px;
  border: 2px solid #149ddd;"></center>
   
  <center><h2 style="color: #3A3A3A; font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; margin-bottom: 20px;">Thank You, <span style="color: #149ddd;">${name}</span>!</h2></center>
  <p style="color: #3A3A3A; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5; margin-bottom: 10px;">Your query:</p>
  <p style="color: #3A3A3A; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5; margin-bottom: 10px;">${message}</p>
  <p style="color: #3A3A3A; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5;">Your email has been received. Your query will be processed shortly! Thank you for contacting me!</p>
  <p style="color: #3A3A3A; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5;">Best regards,<br>Ul Nurkhanov</p>
  `
};

// Send the email to the store
transporter.sendMail(storeMailOptions, function(error, storeInfo) {
  if (error) {
    console.error(error);
    res.status(500).send("Error sending email to store");
  } else {
    console.log("Email sent to store: " + storeInfo.response);

    // Send the email to the user
    transporter.sendMail(userMailOptions, function(error, userInfo) {
      if (error) {
        console.error(error);
        res.status(500).send("Error sending email to user");
      } else {
        console.log("Email sent to user: " + userInfo.response);
        res.status(200).send("Order submitted successfully");
      }
    });
  }
});

});






















app.post("/send-data-kaliamgreenfoundation", (req, res) => {
  
  const {  name , email , message, subject} = req.body;
  const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'specieendangered2024@gmail.com',
    pass: process.env.KALIAM_GREEN_FOUNDATION,
  },
});

const storeMailOptions = {
  from: email,
  to: "contact@kaliamgreenfoundation.com",
  subject: `Message from ${name}:${subject}`,
  html: `
  <center><img src="https://i.ibb.co/MkpttqK/logo.jpg" alt="two" border="0" style=" margin-bottom: 20px; width:80px; "></center>
   
  <center><h2 style="color: #3A3A3A; font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; margin-bottom: 20px;">Great News!</h2></center>
  <center><h2 style="color: #3A3A3A; font-family: Arial, sans-serif; font-size: 18px; margin-bottom: 10px;"><span style="color: #149ddd;">You have received a message from ${name}</span></h2></center>
  <hr style="border: 0.5px solid black;">
  <center><h3 style="color: #3A3A3A; font-family: Arial, sans-serif; font-size: 16px; margin-bottom: 10px;">Message</h3></center>
  <p style="color: #3A3A3A; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5; margin-bottom: 10px;">${message}</p>
  <p style="color: #3A3A3A; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5; margin-top: 10px;">Contact: ${email}</p>

    
    `,
};
const userMailOptions = {
  from: "contact@kaliamgreenfoundation.com",
  to: email,
  subject: "Kaliam Green Foundation",
  html: `
  <center><img src="https://i.ibb.co/MkpttqK/logo.jpg" alt="two" border="0" style=" margin-bottom: 20px; width:80px;"></center>
   
  <center><h2 style="color: #3A3A3A; font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; margin-bottom: 20px;">Thank You, <span style="color: #149ddd;">${name}</span>!</h2></center>
  <p style="color: #3A3A3A; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5; margin-bottom: 10px;">Your query:</p>
  <p style="color: #3A3A3A; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5; margin-bottom: 10px;">${message}</p>
  <p style="color: #3A3A3A; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5;">Your email has been received. Your query will be processed shortly! Thank you for contacting Kaliam Green Foundation!</p>
  <p style="color: #3A3A3A; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5;">Best regards,<br>Kaliam Green Foundation Team</p>
  `
};

// Send the email to the store
transporter.sendMail(storeMailOptions, function(error, storeInfo) {
  if (error) {
    console.error(error);
    res.status(500).send("Error sending email to store");
  } else {
    console.log("Email sent to store: " + storeInfo.response);

    // Send the email to the user
    transporter.sendMail(userMailOptions, function(error, userInfo) {
      if (error) {
        console.error(error);
        res.status(500).send("Error sending email to user");
      } else {
        console.log("Email sent to user: " + userInfo.response);
        res.status(200).send("Order submitted successfully");
      }
    });
  }
});

});








app.get("/", (req,res) =>{
  res.send("Backend server has started running successfully...");
});

const server = app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
  
