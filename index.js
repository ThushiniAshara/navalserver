const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');
const path = require('path');

const multer = require('multer');
const { error, Console } = require('console');

const pdfStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'pdf');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})

const settingStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'settings');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'upload',)
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

const catstorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'upload/category',)
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({ storage: storage })
const pdfUpload = multer({ storage: pdfStorage })
const catupload = multer({ storage: catstorage })
const settingupload = multer({ storage: settingStorage })


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

const db = mysql.createConnection({
    user: 'root',
    host: 'localhost',
    password: '',
    database: 'naval',
});

//Customer CRUD
app.get('/customer/view', (req, res) => {
    db.query("SELECT * FROM customer", (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
})

app.get('/customer/edit/detailsvalidate/:cusEmail', (req, res) => {
    const cusEmail = req.params.cusEmail;
    // const password = req.body.password;

    db.query("SELECT * FROM customer WHERE email = ?", [cusEmail], (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);

        }
    });
})

app.get('/customer/viewbyEmail/:cusEmail', (req, res) => {
    const cusEmail = req.params.cusEmail;
    db.query("SELECT * FROM customer WHERE email = ? ", cusEmail, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
})

app.post('/customer/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    console.log(email + ' ' + password)

    db.query("SELECT * FROM customer WHERE email = ? AND password = ? ", [email, password], (err, result) => {
        if (err) {
            res.send({ err: err });
        }

        if (result.length > 0) {
            res.send(result);
            console.log(result)
        } else {
            res.send({ message: "Email or Password is Wrong" })
        }

    });
});

app.delete('/customer/delete/:email', (req, res) => {
    const email = req.params.email;
    db.query("DELETE FROM downloads WHERE d_customer_id = ?", [email]);
    db.query("DELETE FROM cart WHERE customer = ?", [email]);
    db.query("DELETE FROM payment WHERE p_customer_id = ?", [email]);
    db.query("DELETE FROM customer WHERE email = ?", email, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    })
})

app.delete('/customer/delete/own/:customerEmail', (req, res) => {
    const customerEmail = req.params.customerEmail;
    db.query("DELETE FROM downloads WHERE d_customer_id = ?", customerEmail);
    db.query("DELETE FROM payment WHERE p_customer_id = ?", customerEmail);
    db.query("DELETE FROM cart WHERE customer = ?", customerEmail);
    db.query("DELETE FROM customer WHERE email = ?", customerEmail, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    })
})

app.put('/customer/edit/details/:customer_email', (req, res) => {
    const customer_email = req.params.customer_email;
    let body = req.body;

    const name = req.body.name
    const address = body.address;
    const gender = body.gender;
    const phone = body.phone;

    const success = false;

    if (name) {
        db.query("UPDATE customer SET name = ? WHERE email = ?", [name, customer_email], (err, result) => {
            if (err) {
                console.log(err);
            }
        })
    };

    if (address) {
        db.query("UPDATE customer SET address = ? WHERE email = ?", [address, customer_email], (err, result) => {
            if (err) {
                console.log(err);
            }
        })
    };
    if (phone) {
        db.query("UPDATE customer SET phone = ? WHERE email = ?", [phone, customer_email], (err, result) => {
            if (err) {
                console.log(err);
            }
        })
    };
    if (gender) {
        db.query("UPDATE customer SET gender = ? WHERE email = ?", [gender, customer_email], (err, result) => {
            if (err) {
                console.log(err);
            }
        })
    };

    res.send("seccess");

});

app.put('/customer/edit/password/:customer_email', (req, res) => {
    const customer_email = req.params.customer_email;
    const password = req.body.password

    db.query("UPDATE customer SET password = ? WHERE email = ?", [password, customer_email], (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    })

});

app.put('/customer/edit/email/:customer_email', (req, res) => {
    const customer_email = req.params.customer_email;
    const email = req.body.email

    if (email) {
        db.query("UPDATE downloads SET d_customer_id = ? WHERE d_customer_id = ?", [email, customer_email]);
        db.query("UPDATE payment SET p_customer_id = ? WHERE p_customer_id = ?", [email, customer_email]);
        db.query("UPDATE cart SET customer = ? WHERE customer = ?", [email, customer_email]);

        db.query("UPDATE customer SET email = ? WHERE email = ?", [email, customer_email], (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.send(result);
            }
        })
    };
});


app.post('/customer/create', (req, res) => {
    let body = req.body;

    const name = req.body.name
    const email = body.email;
    const address = body.address;
    const gender = body.gender;
    const phone = body.phone;
    const password = body.password;

    let date_ob = new Date();

    // current date
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();

    const cdate = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;

    db.query("INSERT INTO customer(name, email, address, gender, phone, password, cdate) VALUES(?, ?, ?, ?, ?, ?, ?)", [name, email, address, gender, phone, password, cdate], (err, result) => {

        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    })
})

//Book CRUD

app.put('/book/accept/:book_id', (req, res) => {
    const book_id = req.params.book_id;
    const accept = "Accepted";

    if (book_id) {
        db.query("UPDATE book SET accept_book = ? WHERE book_id = ?", [accept, book_id], (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.send("Success");
            }
        })
    };
});

app.put('/book/reject/:book_id', (req, res) => {
    const book_id = req.params.book_id;
    const accept = "Rejected";

    if (book_id) {
        db.query("UPDATE book SET accept_book = ? WHERE book_id = ?", [accept, book_id], (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.send("Success");
            }
        })
    };
});

app.get('/book/ViewAccept', (req, res) => {
    db.query("SELECT * FROM book join category on book.category = category.cat_id join author on book.author = author.author_id WHERE accept_book = 'Accepted' ORDER BY book.cdate", (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
})

app.get('/book/view', (req, res) => {
    db.query("SELECT * FROM book join category on book.category = category.cat_id join author on book.author = author.author_id ORDER BY book.cdate DESC", (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
})

app.get('/book/search/:key', (req, res) => {
    const key = req.params.key;
    console.log(key);

    db.query(`SELECT * FROM book join category on book.category = category.cat_id join author on book.author = author.author_id WHERE title LIKE '%${key}%' AND accept_book = 'Accepted' `, key, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
            console.log(result);
        }
    });
})

app.get('/book/viewbyid/:author_id', (req, res) => {
    const author_id = req.params.author_id;
    db.query("SELECT * FROM book join category on book.category = category.cat_id join author on book.author = author.author_id WHERE author.author_id = ?", [author_id], (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
})

app.get('/book/numberifBooks/:author_id', (req, res) => {
    const author_id = req.params.author_id;
    db.query("SELECT COUNT(author_id) as count FROM book join author on book.author = author.author_id WHERE author_id = ?",author_id, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
})

app.get('/book/view/:cat_id', (req, res) => {
    const cat_id = req.params.cat_id;

    db.query("SELECT * FROM book join author on book.author = author.author_id where category = ? AND accept_book = 'Accepted' ", [cat_id], (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
})

app.post('/book/pdf', pdfUpload.single('book'), (req, res) => {
    const pdffile = req.file.filename;
    res.send(pdffile);
})

app.post('/book/editimage/:book_id', upload.single('image'), (req, res) => {
    const imagefile = req.file.filename;
    const book_id = req.params.book_id;

    if (imagefile) {
        db.query("UPDATE book SET image = ? WHERE book_id = ?", [imagefile, book_id], (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.send(result);
            }
        })
    };
})

app.post('/book/editpdf/:book_id', pdfUpload.single('book'), (req, res) => {
    const pdffile = req.file.filename;
    const book_id = req.params.book_id;

    if (pdffile) {
        db.query("UPDATE book SET pdf_file = ? WHERE book_id = ?", [pdffile, book_id], (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.send(result);
            }
        })
    };
})

app.put('/book/edit/:book_id', (req, res) => {
    const book_id = req.params.book_id;
    let body = req.body;

    const title = body.title;
    const author = body.author;
    const description = body.description;
    const price = body.price;
    const category = body.category;
    const highlight = body.highlight;

    if (title) {
        db.query("UPDATE book SET title = ? WHERE book_id = ?", [title, book_id], (err, result) => {
            if (err) {
                console.log(err);
            }
        })
    };

    if (author) {
        db.query("UPDATE book SET author = ? WHERE book_id = ?", [author, book_id], (err, result) => {
            if (err) {
                console.log(err);
            }
        })
    };
    if (description) {
        db.query("UPDATE book SET book_description = ? WHERE book_id = ?", [description, book_id], (err, result) => {
            if (err) {
                console.log(err);
            }
        })
    };
    if (price) {
        db.query("UPDATE book SET price = ? WHERE book_id = ?", [price, book_id], (err, result) => {
            if (err) {
                console.log(err);
            }
        })
    };
    if (category) {
        db.query("UPDATE book SET category = ? WHERE book_id = ?", [category, book_id], (err, result) => {
            if (err) {
                console.log(err);
            }
        })
    };
    if (highlight) {
        db.query("UPDATE book SET highlight = ? WHERE book_id = ?", [highlight, book_id], (err, result) => {
            if (err) {
                console.log(err);
            }
        })
    };

    if(book_id){
        res.send("Success");
    }
});


app.delete('/book/delete/:book_id', (req, res) => {
    const book_id = req.params.book_id;
    db.query("DELETE FROM cart WHERE book_id = ?", [book_id]);
    db.query("DELETE FROM downloads WHERE d_book_id = ?", [book_id]);
    db.query("DELETE FROM book WHERE book_id = ?", book_id, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    })
})
app.use('/upload', express.static('upload'))
app.use('/pdf', express.static(__dirname + '/pdf'));
// app.get('/pdf', (req, res) => {
//     res.download('./file.pdf')
// })

app.post('/book/newbook', upload.single('file'), (req, res) => {
    let body = req.body;

    const title = body.title;
    const author = body.author;
    const description = body.description;
    const price = body.price;
    const imagefile = req.file.filename;
    const pdffile = body.pdf;
    const category = body.category;
    const isbn_number = body.isbn_number;
    const highlight = body.highlight;
    const no = "No";

    let date_ob = new Date();

    // current date
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();

    const cdate = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;

    db.query("INSERT INTO book(title, author, book_description, price, image, pdf_file, cdate, accept_book,category,isbn_number ,highlight) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [title, author, description, price, imagefile, pdffile, cdate, no, category, isbn_number, highlight], (err, result) => {

        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    })
})
//Category CRUD
app.use('/upload/category', express.static('category'))
app.post('/category/new', catupload.single('file'), (req, res) => {
    let body = req.body;

    const cat_name = body.cat_name;
    const imagefile = req.file.filename;

    db.query("INSERT INTO category(cat_name, cat_image) VALUES(?, ?)", [cat_name, imagefile], (err, result) => {

        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    })
})

app.delete('/category/delete/:cat_id', (req, res) => {
    const cat_id = req.params.cat_id;
    db.query("DELETE FROM category WHERE cat_id = ?", cat_id, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    })
})

app.get('/category/view', (req, res) => {
    db.query("SELECT DISTINCT cat_name, cat_image, cat_id  FROM category join book on book.category = category.cat_id WHERE accept_book = 'Accepted' ", (err, result) => {


        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
})

app.get('/category/viewAdmin', (req, res) => {
    db.query("SELECT *  FROM category", (err, result) => {


        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
})

app.put('/category/edit/:cat_id', (req, res) => {
    const cat_id = req.params.cat_id;
    const cat_name = req.body.cat_name;

    if (cat_name) {
        db.query("UPDATE category SET cat_name = ? WHERE cat_id = ?", [cat_name, cat_id], (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.send("Success");
            }
        })
    };
});

app.post('/category/edit/editimageupload/:cat_id', catupload.single('image'), (req, res) => {
    const cat_id = req.params.cat_id;
    const imagefile = req.file.filename;

    if (imagefile) {
        db.query("UPDATE category SET cat_image = ? WHERE cat_id = ?", [imagefile, cat_id], (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.send(result);
            }
        })
    }
});

app.get('/category/viewbyid/:cat_id', (req, res) => {
    const cat_id = req.params.cat_id;
    db.query("SELECT * FROM category WHERE cat_id = ?", cat_id, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
});

app.put('/category/edit/imageupload', catupload.single('file'), (req, res) => {
    const cat_id = req.body.cat_id;
    const imagefile = req.file.filename;

    if (imagefile) {
        db.query("UPDATE category SET cat_image = ? WHERE cat_id = ?", [imagefile, cat_id], (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.send("Success");
            }
        })
    }
});


// Author CRUD Start

app.get('/author/viewbyid/:author', (req, res) => {
    const author_id = req.params.author;
    db.query("SELECT * FROM author WHERE author_id = ?", author_id, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
});

app.get('/author/view', (req, res) => {
    db.query("SELECT * FROM author WHERE email != 'admin'", (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
})

app.get('/author/viewwithPayment', (req, res) => {
    db.query("SELECT SUM(book.price) as sum, COUNT(download_id) as count,address, email, phone, name, downloads.cdate FROM author join downloads on downloads.author_id = author.author_id join book on book.book_id = downloads.d_book_id WHERE  MONTH(downloads.cdate) = MONTH(CURRENT_DATE()) AND YEAR(downloads.cdate) = YEAR(CURRENT_DATE()) GROUP BY downloads.author_id ", (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
})

app.get('/author/viewwithPaymentbyID/:author_id', (req, res) => {
    const author_id = req.params.author_id;
    db.query("SELECT SUM(book.price) as sum, COUNT(download_id) as count,address, email, phone, name, downloads.cdate FROM author join downloads on downloads.author_id = author.author_id join book on book.book_id = downloads.d_book_id WHERE  MONTH(downloads.cdate) = MONTH(CURRENT_DATE()) AND YEAR(downloads.cdate) = YEAR(CURRENT_DATE()) AND author.author_id = ? GROUP BY downloads.author_id ",author_id ,(err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
})
app.get('/author/viewwithPaymentbyIDAll/:author_id', (req, res) => {
    const author_id = req.params.author_id;
    db.query("SELECT SUM(book.price) as sum, COUNT(download_id) as count,address, email, phone, name, downloads.cdate FROM author join downloads on downloads.author_id = author.author_id join book on book.book_id = downloads.d_book_id WHERE author.author_id = ? GROUP BY downloads.author_id ",author_id ,(err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
})

app.get('/author/getauthorid/:email', (req, res) => {
    const email = req.params.email;
    db.query("SELECT * FROM author WHERE email = ?", [email], (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
})

app.delete('/author/delete/:author_id', (req, res) => {
    const author_id = req.params.author_id;
    db.query("DELETE FROM author WHERE author_id = ?", author_id, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    })
})

app.delete('/author/delete/book/:author_id', (req, res) => {
    const author_id = req.params.author_id;
    db.query("DELETE FROM book WHERE author = ?", author_id, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    })
})

app.get('/author/edit/detailsvalidate/:authorEmail', (req, res) => {
    const authorEmail = req.params.authorEmail;
    // const password = req.body.password;

    db.query("SELECT * FROM author WHERE email = ?", [authorEmail], (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);

        }
    });
})

app.delete('/author/delete/own/:author_id', (req, res) => {
    const author_id = req.params.author_id;

    db.query("DELETE FROM author WHERE author_id = ?", author_id, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    })
})

app.put('/author/edit/details/:authorEmail', (req, res) => {
    const authorEmail = req.params.authorEmail;
    let body = req.body;

    const name = req.body.name
    const address = body.address;
    const gender = body.gender;
    const phone = body.phone;
    const description = body.description;
    const facebook = body.facebook;
    const twitter = body.twitter;

    const success = false;

    if (name) {
        db.query("UPDATE author SET name = ? WHERE email = ?", [name, authorEmail], (err, result) => {
            if (err) {
                console.log(err);
            }
        })
    };

    if (address) {
        db.query("UPDATE author SET address = ? WHERE email = ?", [address, authorEmail], (err, result) => {
            if (err) {
                console.log(err);
            }
        })
    };
    if (phone) {
        db.query("UPDATE author SET phone = ? WHERE email = ?", [phone, authorEmail], (err, result) => {
            if (err) {
                console.log(err);
            }
        })
    };
    if (gender) {
        db.query("UPDATE author SET gender = ? WHERE email = ?", [gender, authorEmail], (err, result) => {
            if (err) {
                console.log(err);
            }
        })
    };
    if (description) {
        db.query("UPDATE author SET description = ? WHERE email = ?", [description, authorEmail], (err, result) => {
            if (err) {
                console.log(err);
            }
        })
    };
    if (facebook) {
        db.query("UPDATE author SET facebook = ? WHERE email = ?", [facebook, authorEmail], (err, result) => {
            if (err) {
                console.log(err);
            }
        })
    };
    if (twitter) {
        db.query("UPDATE author SET twitter = ? WHERE email = ?", [twitter, authorEmail], (err, result) => {
            if (err) {
                console.log(err);
            }
        })
    };

    res.send("Success");

});

app.put('/author/edit/password/:authorEmail', (req, res) => {
    const authorEmail = req.params.authorEmail;
    const password = req.body.password

    db.query("UPDATE author SET password = ? WHERE email = ?", [password, authorEmail], (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    })

});

app.put('/author/edit/email/:authorEmail', (req, res) => {
    const authorEmail = req.params.authorEmail;
    const email = req.body.email

    if (email) {
        db.query("UPDATE author SET email = ? WHERE email = ?", [email, authorEmail], (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.send(result);
            }
        })
    };
});

app.get('/author/view', (req, res) => {
    db.query("SELECT * FROM author", (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
});

app.post('/author/authorLogin', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    console.log(email + ' ' + password)

    db.query("SELECT * FROM author WHERE email = ? AND password = ? ", [email, password], (err, result) => {
        if (err) {
            res.send({ err: err });
        }

        if (result.length > 0) {
            res.send(result);
            console.log(result)
        } else {
            res.send({ message: "Email or Password is Wrong" })
        }

    });
});

app.post('/author/create', (req, res) => {
    const name = req.body.name;
    const description = req.body.description;
    const address = req.body.address;
    const phone = req.body.phone;
    const gender = req.body.gender;
    const accept = 'No';
    const password = req.body.password;
    const email = req.body.email;
    const facebook = req.body.facebook;
    const twitter = req.body.twitter;

    let date_ob = new Date();

    // current date
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();

    const cdate = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;

    db.query("INSERT INTO author(name, description,address, phone, gender, email, password, cdate, accept, facebook, twitter) VALUES(?,?,?,?,?,?,?,?,?,?,?)", [name, description, address, phone, gender, email, password, cdate, accept, facebook, twitter], (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send("Author Added Success!");
        }
    })
})

app.put('/author/accept', (req, res) => {

    const accept = 'Yes';
    const email = req.body.email;

    db.query("UPDATE author SET  accept = ? WHERE email = ? ", [accept, email], (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send("Your Registration is Success!");
        }
    })
})

//settings codes

app.post('/settings/change', settingupload.single('header'), (req, res) => {
    const imagefile = req.file.filename;
    const title = req.body.title;
    const description = req.body.description;

    if (imagefile) {
        db.query("UPDATE settings SET header_image = ?, title = ?, description = ?", [imagefile, title, description], (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.send(result);
            }
        })
    };
})

app.post('/settings/contact', (req, res) => {

    const email = req.body.email;
    const facebook = req.body.facebook;
    const twitter = req.body.twitter;

    db.query("UPDATE settings SET email = ?, facebook = ?, twitter = ?", [email, facebook, twitter], (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    })

})

app.post('/settings/changeabout', settingupload.single('about'), (req, res) => {
    const imagefile = req.file.filename;
    const description = req.body.description;

    if (imagefile) {
        db.query("UPDATE settings SET about_image = ?, about_description = ?", [imagefile, description], (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.send(result);
            }
        })
    };
})

app.post('/settings/changeservice', settingupload.single('service_image'), (req, res) => {
    const imagefile = req.file.filename;
    const description = req.body.description;

    if (imagefile) {
        db.query("UPDATE settings SET service_image = ?, service_description = ?", [imagefile, description], (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.send(result);
            }
        })
    };
})

app.post('/settings/changesubheader', settingupload.single('subheader'), (req, res) => {
    const imagefile = req.file.filename;

    if (imagefile) {
        db.query("UPDATE settings SET second_header_image = ?", imagefile, (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.send(result);
            }
        })
    };
})

app.post('/settings/changeLoginHeader', settingupload.single('logheader'), (req, res) => {
    const imagefile = req.file.filename;

    if (imagefile) {
        db.query("UPDATE settings SET loginImage = ?", imagefile, (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.send(result);
            }
        })
    };
})

app.post('/settings/changeadminLoginHeader', settingupload.single('adminlogin'), (req, res) => {
    const imagefile = req.file.filename;

    if (imagefile) {
        db.query("UPDATE settings SET adminLoginImage = ?", imagefile, (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.send(result);
            }
        })
    };
})

app.get('/settings/viewHeader', (req, res) => {
    db.query("SELECT * FROM settings", (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
});

app.use('/settings', express.static('settings'))

//cart 

app.delete('/cart/delete/:cart_id', (req, res) => {
    const cart_id = req.params.cart_id;
    db.query("DELETE FROM cart WHERE cart_id = ?", cart_id, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    })
})

app.delete('/cart/delete/all/:customerEmail', (req, res) => {
    const customerEmail = req.params.customerEmail;
    db.query("DELETE FROM cart WHERE customer = ?", customerEmail, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    })
})

app.get('/cart/total/:customerEmail', (req, res) => {
    const customerEmail = req.params.customerEmail;
    db.query("SELECT COUNT(price) as count, SUM(price) as total FROM cart join book on cart.book_id = book.book_id WHERE cart.customer = ?", customerEmail, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    })
})

app.get('/cart/view/:customerEmail', (req, res) => {
    const customerEmail = req.params.customerEmail;
    db.query("SELECT * FROM book join category on book.category = category.cat_id join author on book.author = author.author_id join cart on book.book_id = cart.book_id WHERE cart.customer = ? ", customerEmail, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
})

app.post('/cart/addtocart', (req, res) => {
    const book_id = req.body.book_id;
    const customer_email = req.body.customer_email;

    let date_ob = new Date();

    // current date
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();

    const cdate = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;

    db.query("INSERT INTO cart(customer, book_id, cdate) VALUES(?,?,?)", [customer_email, book_id, cdate], (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    })
})

//contact
app.post('/contact/create', (req, res) => {
    const email = req.body.email;
    const fullname = req.body.fullname;
    const message = req.body.message;

    let date_ob = new Date();

    // current date
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();

    const cdate = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;

    db.query("INSERT INTO contact(email, fullname, message, cdate) VALUES(?,?,?,?)", [email, fullname, message, cdate], (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    })
})

app.get('/contact/view', (req, res) => {

    db.query("SELECT * FROM contact", (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);        }
    });
})

app.delete('/contact/delete/:email', (req, res) => {
    const email = req.params.email;
    db.query("DELETE FROM contact WHERE email = ?", email, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    })
})

//payment

app.get('/payment/view/:customerEmail', (req, res) => {
    const customerEmail = req.params.customerEmail;

    db.query("SELECT * FROM payment join customer on payment.p_customer_id = customer.email WHERE p_customer_id = ? ", customerEmail, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
})

app.get('/payment/view', (req, res) => {
    db.query("SELECT COUNT(downloads.payment_id) as count, total, name, email, address, phone, payment.payment_id FROM payment join customer on payment.p_customer_id = customer.email join downloads on downloads.payment_id = payment.payment_id join book on book.book_id = downloads.d_book_id GROUP BY downloads.payment_id", (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
})

app.get('/download/view/:customerEmail', (req, res) => {
    const customerEmail = req.params.customerEmail;

    db.query("SELECT * FROM downloads join book on downloads.d_book_id = book.book_id join author on book.author = author.author_id WHERE d_customer_id = ? ORDER BY downloads.cdate ", customerEmail, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);        }
    });
})

app.post('/payment/pay', (req, res) => {

    const customer_email = req.body.customer_email;
    const message = 'Paid';
    const total = req.body.total;

    let date_ob = new Date();

    // current date
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();

    const cdate = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;

    db.query("INSERT INTO payment(p_customer_id, payment, cdate, total) VALUES(?,?,?,?)", [ customer_email, message, cdate, total], (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    })
})

app.post('/payment/download', (req, res) => {
    const book_id = req.body.book_id;
    const customer_email = req.body.customer_email;
    const author_id = req.body.author_id;
    const payment_id = req.body.payment_id;

    let date_ob = new Date();

    // current date
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();

    const cdate = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;

    db.query("INSERT INTO downloads(d_book_id, d_customer_id, cdate, author_id, payment_id) VALUES(?,?,?,?,?)", [book_id, customer_email, cdate, author_id, payment_id], (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    })
})


app.delete('/download/deletebyBookID/:book_id', (req, res) => {
    const book_id = req.params.book_id;
    db.query("DELETE FROM downloads WHERE d_book_id = ?", book_id, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    })
})
app.delete('/cart/deletebyBookID/:book_id', (req, res) => {
    const book_id = req.params.book_id;
    db.query("DELETE FROM cart WHERE book_id = ?", book_id, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    })
})

//statistics

app.get('/statistics/view', (req, res) => {

    db.query("SELECT COUNT(payment_id) as count, SUM(total) as sum FROM payment", (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);        }
    });
})

app.get('/statistics/viewAll', (req, res) => {

    db.query("SELECT COUNT(payment_id) as count, SUM(total) as sum FROM payment WHERE  MONTH(cdate) = MONTH(CURRENT_DATE()) AND YEAR(cdate) = YEAR(CURRENT_DATE())", (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);        }
    });
})

app.get('/statistics/viewAuthor/:author_id', (req, res) => {
    const author_id = req.params.author_id;
    db.query("SELECT SUM(book.price) as sum, COUNT(download_id) as count FROM author join downloads on downloads.author_id = author.author_id join book on book.book_id = downloads.d_book_id WHERE  MONTH(downloads.cdate) = MONTH(CURRENT_DATE()) AND YEAR(downloads.cdate) = YEAR(CURRENT_DATE()) AND author.author_id = ?",author_id ,(err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
})

app.get('/statistics/viewAuthorAll/:author_id', (req, res) => {
    const author_id = req.params.author_id;
    db.query("SELECT SUM(book.price) as sum, COUNT(download_id) as count FROM author join downloads on downloads.author_id = author.author_id join book on book.book_id = downloads.d_book_id WHERE  author.author_id = ?",author_id ,(err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
})


app.get('/statistics/getPayment/:author_id', (req, res) => {
    const author_id = req.params.author_id;

    db.query("SELECT COUNT(download_id) as count FROM downloads join book on book.book_id = downloads.d_book_id WHERE book.author = ? ", author_id ,(err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);        }
    });
})

app.listen(3001, () => {
    console.log("Server started! Welcome to Book Tour Server");
});