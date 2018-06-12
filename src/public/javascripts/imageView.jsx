// index.js
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import fetch from 'node-fetch';

export default class ImageView extends Component {
    constructor(props){
        super(props);
        this.state = {
            url: props.url,
            loadImagesFromIndexedDB: props.loadImagesFromIndexedDB
        }

        this.handleClick = this.handleClick.bind(this);
    }    

    openIndexedDB(){
        function dbErrorHandler(db, reject){
            db.onerror = function(e){
                console.error("Database error: ", e.target.errorCode);
                reject(e.target.errorCode);
            }
        }

        return new Promise((resolve, reject) => {
            var db;
            var request = window.indexedDB.open("MyTestDatabase", 1);

            request.onerror = function(e){
                console.error("Request error: ", e.target.errorCode);
                reject(e.target.errorCode);
            }

            request.onupgradeneeded = function(e){
                console.log("Creating a new database or upgrading...");
                db = e.target.result;
                dbErrorHandler(db, reject);
                var objectStore = db.createObjectStore("images", { autoIncrement: true });
            }

            request.onsuccess = function(e){
                console.log("Success opening DB");
                db = e.target.result;
                dbErrorHandler(db, reject);
                resolve(db);
            }
        });    
    }

    saveToIndexedDB(blob, db){
        return new Promise((resolve, reject) => {
            var transaction = db.transaction(["images"], "readwrite");

            transaction.oncomplete = function(e) {
                console.log("Completed readwrite transaction");
                resolve();
            };
                        
            transaction.onerror = function(e) {
                console.error("Transaction error: ", e.target.errorCode);
                reject(e.target.errorCode);
            };  
                
            var objectStore = transaction.objectStore("images"); 
            objectStore.add(blob);
        });
    }

    getBlob(){
        return (fetch(this.state.url, {
            method: 'GET'
        })
        .then(res => {
            if (!res.ok){
                console.error(res.statusText);
                return res;
            } else {
                return res.blob()
            }
        }));
    }

    getBlobAndOpenDB() {
        var blob = this.getBlob();
        var db = this.openIndexedDB();
        return Promise.all([blob, db]);
    }

    handleClick(e){
        var self = this;
        this.getBlobAndOpenDB()
            .then(combinedPromiseResults => self.saveToIndexedDB(combinedPromiseResults[0], combinedPromiseResults[1]));
        e.preventDefault();
    }
    
    render() {
      return (
          <div>
            <a href={this.state.url} target="_blank">
                <figure>
                    <img className="imageView" src={this.state.url} />
                </figure>
            </a>
            <button type="button" className="imageViewButton" onClick={this.handleClick}>Save image</button>
          </div>
      )
    }
  }

