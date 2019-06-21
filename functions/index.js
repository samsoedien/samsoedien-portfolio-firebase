const functions = require("firebase-functions");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const { check, validationResult } = require("express-validator");

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

const app = express();

app.use(cors({ origin: true }));

app.use(express.json({ extended: false }));

app.post(
  "/",
  [
    check("name", "Name field is required")
      .not()
      .isEmpty(),
    check("email", "Email field is required")
      .not()
      .isEmpty()
      .isEmail()
      .withMessage("Email is invalid"),
    check("message", "Message field is required")
      .not()
      .isEmpty()
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    ("use strict");
    async function main() {
      // Generate test SMTP service account from ethereal.email
      // Only needed if you don't have a real mail account for testing
      // let account = await nodemailer.createTestAccount();

      const htmlEmail = `
      <p>Dear ${req.body.name},</p>

      <p class="default-style">Thank you for your message. I will contact you at my earliest convenience.</p>
      <p class="default-style">Bedankt voor uw bericht. Ik zal zo spoedig contact met u opnemen.</p>
              
      <h3>Contact Details</h3>
      <ul>
        <li>Name: ${req.body.name}</li>
        <li>Email: ${req.body.email}</li>
        <li>Subject: ${req.body.subject}</li>
      </ul>
      <h3>Your Message</h3>
      <p>${req.body.message}</p>
      
      <p class="default-style"><span style="font-size: 10pt; font-family: helvetica;">Kind regards, / Met vriendelijke groet,<br /></span></p>
      <p class="default-style"><span style="font-size: 10pt; font-family: helvetica;">Noerani Samsoedien</span></p>
      <div class="default-style"><span style="font-size: 7pt; font-family: helvetica;">--</span></div>
      <div class="default-style"><span style="font-size: 7pt; font-family: helvetica;">ir. N. Samsoedien</span></div>
      <div class="default-style"><span style="font-size: 7pt; font-family: helvetica;">Industrial Designer</span><span style="font-size: 7pt; font-family: helvetica;"></span></div>
      <div class="default-style"></div>
      <div class="default-style"><span style="font-size: 7pt; font-family: helvetica;">T: +31 (0)6 308 378 22</span></div>
      <div class="default-style"><span style="font-size: 7pt; font-family: helvetica;">E: <a href="mailto:contact@samsoedien.com">contact@samsoedien.com</a></span></div>
      <div class="default-style"><span style="font-size: 7pt; font-family: helvetica;">W: <a href="https://www.samsoedien.com">https://www.samsoedien.com</a></span></div>
      <div class="default-style"><span style="font-size: 7pt; font-family: helvetica;">L: <a href="https://www.linkedin.com/in/samsoedien/">https://www.linkedin.com/in/samsoedien/</a></span></div>
    `;

      // create reusable transporter object using the default SMTP transport
      let transporter = nodemailer.createTransport({
        host: functions.config().transporter.host,
        port: functions.config().transporter.port,
        secure: true, // true for 465, false for other ports
        auth: {
          user: functions.config().transporter.username, //account.user, // generated ethereal user
          pass: functions.config().transporter.password //account.pass // generated ethereal password
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      // setup email data with unicode symbols
      let mailOptions = {
        from: '"Samsoedien, N" <noreply@samsoedien.com>', // sender address
        to: req.body.email, // list of receivers
        cc: "contact@samsoedien.com",
        replyTo: req.body.email,
        subject: req.body.subject, // Subject line
        text: req.body.message, // plain text body
        // attachments: [
        //   {
        //     fileName: req.body.title,
        //     streamSource: fs.createReadStream(req.files.image.path)
        //   }
        // ],
        html: htmlEmail // html body
      };

      console.log(mailOptions);
      // send mail with defined transport object
      let info = await transporter.sendMail(mailOptions);

      console.log("Message sent: %s", info.messageId);
      // Preview only available when sending through an Ethereal account
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      console.log(transporter.options.host);

      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
      // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    }
    main().catch(console.error);
    return res.status(201).json({ message: "Email has been sent" });
  }
);

exports.contact = functions.https.onRequest(app);
