import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Dynamically import nodemailer for Node.js runtime compatibility
    const nodemailer = require('nodemailer');

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'stepuphs.67@gmail.com',
        pass: process.env.STEPUP_GMAIL_APP_PASSWORD, // Use an app password, not your real password
      },
    });

    await transporter.sendMail({
      from: 'stepuphs.67@gmail.com',
      to: 'stepuphs.67@gmail.com',
      subject: `Contact Form Submission from ${name}`,
      replyTo: email,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
} 