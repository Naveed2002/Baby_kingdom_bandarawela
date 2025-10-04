const express = require('express');
const Contact = require('../models/Contact');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/contact
// @desc    Submit contact form
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Basic validation
    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    // Phone validation (Sri Lankan format)
    const phoneRegex = /^(\+94|0)[1-9][0-9]{8}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: 'Please enter a valid Sri Lankan phone number' });
    }

    // Create contact submission
    const contact = new Contact({
      name,
      email,
      phone,
      subject,
      message
    });

    await contact.save();

    // TODO: Send email notification to admin
    // For now, just log it
    console.log('New contact form submission:', {
      name,
      email,
      phone,
      subject,
      message,
      timestamp: new Date().toISOString()
    });

    res.status(201).json({
      message: 'Thank you for your message! We will get back to you soon.',
      contactId: contact._id
    });
  } catch (error) {
    console.error('Contact form submission error:', error);
    res.status(500).json({ message: 'Server error while submitting contact form' });
  }
});

// ===== ADMIN ROUTES =====

// @route   GET /api/contact
// @desc    Get all contact submissions (Admin only)
// @access  Private/Admin
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      isRead
    } = req.query;

    const filter = {};
    
    if (status) filter.status = status;
    if (isRead !== undefined) filter.isRead = isRead === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Contact.countDocuments(filter);

    res.json({
      contacts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalContacts: total,
        hasNext: skip + contacts.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ message: 'Server error while fetching contacts' });
  }
});

// @route   GET /api/contact/:id
// @desc    Get contact submission by ID (Admin only)
// @access  Private/Admin
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id).select('-__v');

    if (!contact) {
      return res.status(404).json({ message: 'Contact submission not found' });
    }

    // Mark as read
    if (!contact.isRead) {
      contact.isRead = true;
      await contact.save();
    }

    res.json({ contact });
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({ message: 'Server error while fetching contact' });
  }
});

// @route   PUT /api/contact/:id/status
// @desc    Update contact status (Admin only)
// @access  Private/Admin
router.put('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({ message: 'Contact submission not found' });
    }

    const updates = {};
    if (status) {
      updates.status = status;
      if (status === 'Resolved') {
        updates.resolvedAt = new Date();
      }
    }
    if (adminNotes !== undefined) updates.adminNotes = adminNotes;

    const updatedContact = await Contact.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Contact status updated successfully',
      contact: updatedContact
    });
  } catch (error) {
    console.error('Update contact status error:', error);
    res.status(500).json({ message: 'Server error while updating contact status' });
  }
});

// @route   DELETE /api/contact/:id
// @desc    Delete contact submission (Admin only)
// @access  Private/Admin
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({ message: 'Contact submission not found' });
    }

    await Contact.findByIdAndDelete(req.params.id);

    res.json({ message: 'Contact submission deleted successfully' });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ message: 'Server error while deleting contact' });
  }
});

module.exports = router;
