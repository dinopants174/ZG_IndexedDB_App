// index.js
import React, { Component } from 'react'
import ReactDOM from 'react-dom'

export default class ImageView extends Component {
    constructor(props){
        super(props);
        this.state = {
            url: props.url,
            saved: props.saved,
            id: props.id,
            loadImagesFromIndexedDB: props.loadImagesFromIndexedDB,
            updateGallery: props.updateGallery,
            db: props.db,
            disabled: false
        }

        this.handleClick = this.handleClick.bind(this);
    }    

    componentWillReceiveProps(nextProps){
        this.setState({
            saved: nextProps.saved,
            db: nextProps.db
        });
    }
    
    saveToIndexedDB(blob){
        var self = this;

        return new Promise((resolve, reject) => {
            var transaction = this.state.db.transaction(["images"], "readwrite");

            transaction.oncomplete = function(e) {
                resolve(self.state.id);
            };
                        
            transaction.onerror = function(e) {
                console.error("Transaction error: ", e.target.errorCode);
                reject(e.target.errorCode);
            };  
                
            var objectStore = transaction.objectStore("images"); 
            objectStore.add(blob);
        });
    }
    
    handleClick(e){
        fetch(this.state.url, {
                method: 'GET'
            })
            .then(res => {
                if (!res.ok){
                    console.error(res.statusText);
                    throw res.statusText;
                } else {
                    return res.blob()
                }
            })
            .then(blob => this.saveToIndexedDB(blob))
            .then(id => this.state.updateGallery(id))
            .catch(error => this.setState({
                disabled: true     
            }));
        e.preventDefault();
    }

    handleView(state){
        if (state.saved){
            return (
                <p>Saved!</p>
            )  
        } else {
            return (
                <button type="button" className="imageViewButton" onClick={this.handleClick} disabled={state.disabled}>Save image</button>
            )
        }
    }
    
    render() {
      return (
          <div>
            <a href={this.state.url} target="_blank">
                <figure>
                    <img className="imageView" src={this.state.url} />
                </figure>
            </a>
            {this.handleView(this.state)}
          </div>
      )
    }
  }

