import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import nodemailer from 'nodemailer';
import { config } from '@/data/config';

// Contact message interface
interface ContactMessage {
  fullName: string;
  email: string;
  message: string;
  createdAt: Date;
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// OPTIONS - Handle preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// POST - Handle contact form submissions
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { fullName, email, message } = body;

    // Validation
    if (!fullName || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Message length validation
    if (message.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Message must be at least 10 characters long' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Check if email service is configured
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.error('Email service not configured');
      return NextResponse.json(
        { success: false, error: 'Email service not configured' },
        { status: 500, headers: corsHeaders }
      );
    }

    // Create Gmail SMTP transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Email content
    const mailOptions = {
      from: `"Portfolio Contact" <${process.env.GMAIL_USER}>`,
      to: config.email,
      replyTo: email,
      subject: `Portfolio Contact: ${fullName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 10px 0;"><strong>Name:</strong> ${fullName}</p>
            <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
          </div>
          <div style="background: #fff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px;">
            <h3 style="color: #333; margin-top: 0;">Message:</h3>
            <p style="color: #555; line-height: 1.6; white-space: pre-wrap;">${message}</p>
          </div>
          <p style="color: #888; font-size: 12px; margin-top: 20px;">
            This email was sent from your portfolio contact form.
          </p>
        </div>
      `,
      text: `
New Contact Form Submission

Name: ${fullName}
Email: ${email}

Message:
${message}
      `,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Contact email sent successfully:', info.messageId);

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      id: info.messageId,
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send email' },
      { status: 500, headers: corsHeaders }
    );
  }
}