const express = require('express');
const service = require('./appService');

const router = express.Router();

// ----------------------------------------------------------
// API endpoints
// Modify or extend these routes based on your project's needs.
router.get('/check-db-connection', async (req, res) => {
    const isConnect = await service.testOracleConnection();
    if (isConnect) {
        res.send('connected');
    } else {
        res.send('unable to connect');
    }
});

// ----------------------------------------------------------
// routes for testing

router.post("/initiate", async (req, res) => {
    const initiateResult = await service.resetAndPopulateTables();
    if (initiateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// Entities

router.get('/users', async (req, res) => {
    const tableData = await service.fetchFromDb('Users');
    res.json({ data: tableData });
});

router.get('/media', async (req, res) => {
    const tableData = await service.fetchFromDb('Media');
    res.json({ data: tableData });
});

router.get('/reviews', async (req, res) => {
    const tableData = await service.fetchFromDb('Reviews');
    res.json({ data: tableData });
});

router.get('/discussion_board', async (req, res) => {
    const tableData = await service.fetchFromDb('DiscussionBoard');
    res.json({ data: tableData });
});

router.get('/board_status', async (req, res) => {
    const tableData = await service.fetchFromDb('BoardStatus');
    res.json({ data: tableData });
});

router.get('/popularity', async (req, res) => {
    const tableData = await service.fetchFromDb('Popularity');
    res.json({ data: tableData });
});

router.get('/post', async (req, res) => {
    const tableData = await service.fetchFromDb('Post');
    res.json({ data: tableData });
});

router.get('/community', async (req, res) => {
    const tableData = await service.fetchFromDb('Community');
    res.json({ data: tableData });
});

router.get('/crew_member', async (req, res) => {
    const tableData = await service.fetchFromDb('CrewMember');
    res.json({ data: tableData });
});

router.get('/studio', async (req, res) => {
    const tableData = await service.fetchFromDb('Studio');
    res.json({ data: tableData });
});

router.get('/show', async (req, res) => {
    const tableData = await service.fetchFromDb('Show');
    res.json({ data: tableData });
});

router.get('/movie', async (req, res) => {
    const tableData = await service.fetchFromDb('Movie');
    res.json({ data: tableData });
});

router.get('/reliability', async (req, res) => {
    const tableData = await service.fetchFromDb('Reliability');
    res.json({ data: tableData });
});

// Relations

router.get('/has_episode', async (req, res) => {
    const tableData = await service.fetchFromDb('HasEpisode');
    res.json({ data: tableData });
});

router.get('/member_of', async (req, res) => {
    const tableData = await service.fetchFromDb('MemberOf');
    res.json({ data: tableData });
});

router.get('/contain', async (req, res) => {
    const tableData = await service.fetchFromDb('Contain');
    res.json({ data: tableData });
});

router.get('/makes_post', async (req, res) => {
    const tableData = await service.fetchFromDb('MakesPost');
    res.json({ data: tableData });
});

router.get('/has_favourite', async (req, res) => {
    const tableData = await service.fetchFromDb('HasFavourite');
    res.json({ data: tableData });
});

router.get('/worked_on', async (req, res) => {
    const tableData = await service.fetchFromDb('WorkedOn');
    res.json({ data: tableData });
});

router.get('/produced', async (req, res) => {
    const tableData = await service.fetchFromDb('Produced');
    res.json({ data: tableData });
});

// ----------------------------------------------------------
// 11 queries

// insertion into Reviews
router.post('/insertion', async (req, res) => {
    const { username, mID, rating, title, comments } = req.body;
    const date = new Date();
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
    const day = date.getUTCDate().toString().padStart(2, "0");
    const date_created = `${year}-${month}-${day}`; // YYYY-MM-DD
    const success = await service.insertionQuery(username, mID, date_created, rating, title, comments);
    if (success) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// deletion of community --> cascade with MemberOf relation
router.post('/deletion', async (req, res) => {
    const { name } = req.body;
    const success = await service.deletionQuery(name);
    if (success) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// update User: gender, age, email (unique)
router.post('/update', async (req, res) => {
    const { username, gender, age, email } = req.body;
    const success = await service.updateQuery(username, gender, age, email);
    if (success) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// join Reviews and Media and return list of reviews for a given title
router.post('/join', async (req, res) => {
    const { title } = req.body;
    const data = await service.joinQuery(title);
    return res.json(data);
});

// aggregation group by --> number of reviews per user
router.get('/groupby', async (req, res) => {
    const data = await service.groupByQuery();
    return res.json(data);
});

// aggregation having --> crew members with at least two favourites
router.get('/having', async (req, res) => {
    const data = await service.havingQuery();
    return res.json(data);
})

// nested group by --> highest average rated media
router.get('/nested', async (req, res) => {
    const data = await service.nestedQuery();
    return res.json(data);
})

// division --> get all users who reviewed all media of a genre given by user
router.post('/division', async (req, res) => {
    const { genre } = req.body;
    const data = await service.divisionQuery(genre);
    return res.json(data);
})

// project User: username, gender, age, email, date joined
router.post('/projection', async (req, res) => {
    const { username, gender, age, email, date_joined } = req.body;
    const { data, success } = await service.projectionQuery(username, gender, age, email, date_joined);
    if (success) {
        return res.json({ data, success });
    } else {
        res.status(500).json({ data, success });
    }
});

// selection on media: mID, title, genre, date released
router.post('/selection', async (req, res) => {
    const { text } = req.body;
    const { data, success } = await service.selectionQuery(text);
    if (success) {
        return res.json({ data, success });
    } else {
        res.status(500).json({ data, success });
    }
});

module.exports = router;