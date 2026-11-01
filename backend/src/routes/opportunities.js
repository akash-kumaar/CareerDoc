const express = require('express');
const service = require('../services/opportunitiesService');

const router = express.Router();

// GET /api/opportunities - list with search/filter support
router.get('/', async (req, res) => {
  try {
    const { search, type, status, work_arrangement } = req.query;
    const opportunities = await service.listOpportunities({ search, type, status, work_arrangement });
    res.status(200).json(opportunities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch opportunities' });
  }
});

// GET /api/opportunities/:id
router.get('/:id', async (req, res) => {
  try {
    const opportunity = await service.getOpportunityById(req.params.id);
    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }
    res.status(200).json(opportunity);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch opportunity' });
  }
});

// POST /api/opportunities
router.post('/', async (req, res) => {
  try {
    const errors = service.validateCreate(req.body);
    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') });
    }
    const opportunity = await service.createOpportunity(req.body);
    res.status(201).json(opportunity);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create opportunity' });
  }
});

// PUT /api/opportunities/:id
router.put('/:id', async (req, res) => {
  try {
    const errors = service.validateUpdate(req.body);
    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') });
    }
    const existing = await service.getOpportunityById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }
    const updated = await service.updateOpportunity(req.params.id, req.body);
    res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update opportunity' });
  }
});

// PATCH /api/opportunities/:id/status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !service.ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `status must be one of: ${service.ALLOWED_STATUSES.join(', ')}`,
      });
    }
    const existing = await service.getOpportunityById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }
    const updated = await service.updateStatus(req.params.id, status);
    res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// DELETE /api/opportunities/:id
router.delete('/:id', async (req, res) => {
  try {
    const existing = await service.getOpportunityById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }
    await service.deleteOpportunity(req.params.id);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete opportunity' });
  }
});

module.exports = router;
