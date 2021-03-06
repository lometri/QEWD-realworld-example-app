/*
 ----------------------------------------------------------------------------
 | qewd-conduit: QEWD Implementation of the Conduit Back-end                |
 |                                                                          |
 | Copyright (c) 2017 M/Gateway Developments Ltd,                           |
 | Reigate, Surrey UK.                                                      |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://www.mgateway.com                                                  |
 | Email: rtweed@mgateway.com                                               |
 |                                                                          |
 |                                                                          |
 | Licensed under the Apache License, Version 2.0 (the "License");          |
 | you may not use this file except in compliance with the License.         |
 | You may obtain a copy of the License at                                  |
 |                                                                          |
 |     http://www.apache.org/licenses/LICENSE-2.0                           |
 |                                                                          |
 | Unless required by applicable law or agreed to in writing, software      |
 | distributed under the License is distributed on an "AS IS" BASIS,        |
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. |
 | See the License for the specific language governing permissions and      |
 |  limitations under the License.                                          |
 ----------------------------------------------------------------------------

  3 May 2017

*/

var validation = require('../utilities/validation');
var errorHandler = require('../utilities/errorHandler');
var getArticleIdBySlug = require('./getArticleIdBySlug');
var getArticle = require('./getArticle');

function favourite(args, callback) {

  // Favorite an Article

  // validate JWT

  var errors;
  var status = validation.jwt.call(this, args);
  if (status.error) return callback(status);
  var id = status.payload.id;
  var userRecord = status.userRecord;

  // check that the slug exists

  var slug = args.slug;

  //console.log('*** favorite - slug = ' + slug);

  var articleId = getArticleIdBySlug.call(this, slug);
  if (!articleId) {
    // no article with that slug
    return errorHandler.notFound(callback);
  }

  // Note: can't favorite your own article

  var articleDoc = new this.documentStore.DocumentNode('conduitArticles', ['byId', articleId]);

  if (id !== articleDoc.$('author').value) {

    // has user already favourited this article?

    var userFavorited = userRecord.$(['favorited', articleId]);
    if (!userFavorited.exists) {

      // record the favorite against the user

      userFavorited.value = articleId;

      // increment the article's favourites count

      articleDoc.$('favoritesCount').increment();
    }
  }

  // fetch the article object

  var article = getArticle.call(this, articleId, id);

  callback({article: article});
}

module.exports = favourite;
