const express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();
var multer = require('multer');

const Grant = require('../models/grant');

var MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg'
}

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const isValid = MIME_TYPE_MAP[file.mimetype];
        let error = new Error("Invalid mime type");
        if (isValid) {
            error = null;
        }
        cb(error, './images');
    },
    filename: (req, file, cb) => {
        const name = file.originalname.toLowerCase().split(' ').join('-');
        const ext = MIME_TYPE_MAP[file.mimetype];
        cb(null, name + '-' + Date.now() + '.' + ext);
    }
});

// Upload File
router.post('/file', multer({storage: storage}).single('image'), (req, res, next) => {
    const url = req.protocol + '://' + req.get('host');
    console.log('path: ' (url + '/images/' + req.file.filename));
})

// Get Grants
router.get('/', function(req, res, next) {
    var filters = req.query;
    Grant.find(filters)
        .select('_id name price')
        .exec(function(err, grants) {
            if (err) {
                return res.status(500).json({
                    title: 'An error occured',
                    error: err
                })
            }
            res.status(200).json(grants)
        })
})

// Find one Grant by id 
router.get('/details/:id', function(req, res, next) {
    Grant.findById(req.params.id, function(err, grant) {
        if (err) {
            return res.status(500).json({
                title: 'An error occured',
                error: err
            })
        }
        if (!grant) {
            return res.status(500).json({
                title: 'No grants found',
                error: err
            })
        }
        res.status(200).json({
            message: 'Success',
            obj: grant
        })
    })
})

// Save Grant
router.post('/', function(req, res, next) {
    var grant = new Grant({
        name: req.body.name,
        grantor: req.body.grantor,
        url: req.body.url,
        dateStart: req.body.dateStart,
        deadline: req.body.deadline,
        price: req.body.price,
        geoScale: req.body.geoScale,
        grantee: req.body.grantee,
        region: req.body.region,
        city: req.body.city,
        description: req.body.description,
        categories: req.body.categories,
    });
    grant.save(function(err, result) {
        if (err) {
            return res.status(500).json({
                title: 'An error occured',
                error: err
            })
        }
        res.status(201).json(result)
    })
})

// Delete one Grant
router.delete('/:id', function(req, res, next) {
    var decoded = jwt.decode(req.query.token);
    Grant.findById(req.params.id, function(err, grant) {
        if (err) {
            return res.status(500).json({
                title: 'An error occured',
                error: err
            })
        }
        if (!grant) {
            return res.status(500).json({
                title: 'No grant found!',
                error: {message: 'Grant not found!'}
            })
        }
        if (decoded.user.role !== 'administrator') {
            return res.status(401).json({
                title: 'Permission denied!',
                error: {message: "User's role does not match"}
            })
        }
        grant.remove(function(err, result) {
            if (err) {
                return res.status(500).json({
                  title: 'An error occured',
                  error: err
                })
            }
            res.status(200).json({
                message: 'Deleted message',
                obj: result
            })
        })
    })
})

module.exports = router;