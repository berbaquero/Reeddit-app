(function(win) {

    var T = { // Templates

        Posts: "{{#children}}<article class='link-wrap'><a class='link' href='{{data.url}}' data-id='{{data.id}}' target='_blank'><div class='link-thumb'><div style='background-image: url({{data.thumbnail}})'></div></div><div class='link-info'><p class='link-title'>{{data.title}}</p><p class='link-domain'>{{data.domain}}</p><p class='link-sub'>{{data.subreddit}}</p>{{#data.over_18}}<p class='link-nsfw'>NSFW</p>{{/data.over_18}}</div></a><div class='to-comments' data-id='{{data.id}}'><div class='right-arrow'></div></div></article>{{/children}}<div class='list-button'><span id='more-links'>More</span></div><div id='main-overflow'></div>",

        Subreddits: {

            list: "{{#.}}<li data-name='{{.}}'><p class='sub'>{{.}}</p></li>{{/.}}",

            toRemoveList: "<p class='edit-subs-title'>Subreddits</p><ul class='remove-list'>{{#.}}<div class='item-to-edit sub-to-remove' data-name='{{.}}'><p>{{.}}</p><div class='btn-remove-subreddit' data-name='{{.}}'></div></div>{{/.}}</ul>",

            toAddList: "{{#children}}<div class='subreddit'><div><p class='subreddit-title'>{{data.display_name}}</p><p class='subreddit-desc'>{{data.public_description}}</p></div><div class='btn-add-sub'><div></div></div></div>{{/children}}"
        },

        Channels: {

            singleEditItem: "<div class='item-to-edit channel-to-remove' data-title='{{name}}'><p class='channel-name'>{{name}}</p><div class='btn-edit-channel' data-title='{{name}}'></div><div class='btn-remove-channel' data-title='{{name}}'></div></div>",

            single: '<li><div class="channel" data-title="{{name}}"><p>{{name}}</p><div>{{#subs}}<p>{{.}}</p>{{/subs}}</div></div></li>',

            list: '{{#.}}<li><div class="channel" data-title="{{name}}"><p>{{name}}</p><div>{{#subs}}<p>{{.}}</p>{{/subs}}</div></div></li>{{/.}}'
        },

        linkSummary: "<section id='link-summary'><a href='{{url}}' target='_blank'><p id='summary-title'>{{title}}</p><p id='summary-domain'>{{domain}}</p>{{#over_18}}<span class='link-nsfw summary-nsfw'>NSFW</span>{{/over_18}}</a><div id='summary-footer'><p id='summary-author'>by {{author}}</p><div class='btn-general btn-share'></div></div><div id='summary-extra'><p id='summary-sub'>{{subreddit}}</p><p id='summary-time'></p><a id='summary-comment-num' href='http://reddit.com{{link}}' target='_blank'>{{num_comments}} comments</a></section>",

        formAgregarSubManual: '<div class="new-form" id="form-new-sub"><div class="form-left-corner"><div class="btn-general" id="btn-add-new-sub">Add Subreddit</div></div><div class="close-form">close</div><form><input type="text" id="txt-new-sub" placeholder="New subreddit name" /></form></div>',

        formAddNewChannel: '<div class="new-form" id="form-new-channel"><div class="form-left-corner"><div class="btn-general" id="btn-submit-channel" data-op="save">Add Channel</div></div><div class="close-form">close</div><input type="text" id="txt-channel" placeholder="Channel name" /><div id="subs-for-channel"><input class="field-edit-sub" type="text" placeholder="Subreddit 1" /><input class="field-edit-sub" type="text" placeholder="Subreddit 2" /><input class="field-edit-sub" type="text" placeholder="Subreddit 3" /></div><div id="btn-add-another-sub">Add additional subreddit</div></div>',

        formEditChannel: '<div class="new-form" id="form-new-channel"><div class="form-left-corner"><div class="btn-general" id="btn-submit-channel" data-op="update">Update Channel</div></div><div class="close-form">close</div><input type="text" id="txt-channel" placeholder="Channel name" /><div id="subs-for-channel"></div><div id="btn-add-another-sub">Add additional subreddit</div></div>',

        botonCargarMasSubs: "<div class='list-button'><span id='more-subs'>More</span></div>",

        noLink: "No Post Selected",

        moveData: "<div class='new-form move-data'><div class='close-form'>close</div><div class='move-data-exp'><h3>Export & Backup</h3><p>Tip: save on your Dropbox folder, so you can import your subscriptions to any other Reeddit instance (e.g. your mobile or tablet).</p><div class='btn-general' id='btn-save-data'>Save Data</div></div><div class='move-data-imp'><h3>Import & Restore</h3><p>Load your subscription from any other Reeddit instance - after choosing the file, Reedit will refresh.</p><input id='btn-import-data' type='file'></div></div>",

        updater: "<div class='new-form move-data'><div class='close-form'>close</div><h3>{{version.label}} available</h3><p>Updated on: {{update.date}}</p><p>• {{update.title}}:</p><p>{{update.message}}</p><div class='btn-general' id='btn-download' data-link='{{version.download_url}}'>Download new version</div></div>",

        notification: '<div class="notification">{{text}}</div>'
    };

    var doc = win.document,
        body = doc.body;

    var gui = require('nw.gui'),
        mainWindow = gui.Window.get(),
        version = 1910;

    // Pseudo-Globals
    var editingSubs = false,
        urlInit = "http://www.reddit.com/",
        urlEnd = ".json",
        urlLimitEnd = ".json?limit=30",
        loadedLinks = {},
        replies = {},
        showingMenu = false,
        store = win.localStorage,
        esModal = false,
        loadingComments = false,
        loadingLinks = false,
        currentThread, isWideScreen = checkWideScreen(),
        isLargeScreen = checkLargeScreen(),
        currentSortingChoice = 'hot',
        // Pseudo-Enums
        move = {
            left: 1,
            right: 2
        },
        view = {
            main: 1,
            comments: 2
        },
        selection = {
            sub: 1,
            channel: 2
        },
        css = {
            showView: "show-view",
            showMenu: "show-menu",
            hide: "hide"
        },
        currentView = view.main;

    var defaultSubs = ["frontPage", "pics", "IAmA", "AskReddit", "worldNews", "todayilearned", "tech", "science", "atheism", "reactiongifs", "books", "videos", "AdviceAnimals", "funny", "aww", "earthporn"];

    var defaultChannel = {
        name: "Media",
        subs: ["movies", "games", "television", "music"]
    };

    var M = { // Model

        Posts: {

            list: {},

            setList: function(posts) {
                for (var i = 0; i < posts.children.length; i++) {
                    var post = posts.children[i];
                    if (M.Posts.list[post.data.id]) { // Si ya se ha cargado este link localmente
                        // Se actualizan los datos dinamicos
                        M.Posts.list[post.data.id].num_comments = post.data.num_comments;
                        M.Posts.list[post.data.id].created_utc = post.data.created_utc;
                    } else { // Si no se han cargado los links localmente
                        M.Posts.list[post.data.id] = {
                            title: post.data.title,
                            selftext: post.data.selftext,
                            created_utc: post.data.created_utc,
                            domain: post.data.domain,
                            subreddit: post.data.subreddit,
                            num_comments: post.data.num_comments,
                            url: post.data.url,
                            self: post.data.is_self,
                            link: post.data.permalink,
                            author: post.data.author,
                            over_18: post.data.over_18
                        };
                    }
                }
            },

            idLast: ''
        },

        Subreddits: {

            list: [],

            add: function(sub) {
                if (!M.Subreddits.listHasSub(sub)) {
                    M.Subreddits.list.push(sub);
                    store.setItem("subreeddits", JSON.stringify(M.Subreddits.list));
                }
            },

            setList: function(subs) {
                M.Subreddits.list = subs;
                store.setItem("subreeddits", JSON.stringify(M.Subreddits.list));
            },

            remove: function(sub) {
                var idx = M.Subreddits.list.indexOf(sub);
                M.Subreddits.list.splice(idx, 1);
                store.setItem("subreeddits", JSON.stringify(M.Subreddits.list));
            },

            listHasSub: function(sub) {
                if (M.Subreddits.list) {
                    var i = M.Subreddits.list.indexOf(sub);
                    return i > -1;
                }
                return false;
            },

            getAllString: function() {
                var allSubs = '';
                for (var i = 0; i < M.Subreddits.list.length; i++) {
                    var sub = M.Subreddits.list[i];
                    if (sub.toUpperCase() === 'frontPage'.toUpperCase()) continue;
                    allSubs += sub + '+';
                }
                return allSubs.substring(0, allSubs.length - 1);
            },

            idLast: ''
        },

        Channels: {

            list: [],

            getURL: function(channel) {
                if (channel.subs.length === 1) { // Reddit API-related hack
                    // If there's one subreddit in a "Channel", and this subreddit name's invalid, reddit.com responds with a search-results HTML - not json data - and throws a hard-to-catch error...
                    return "r/" + channel.subs[0] + "+" + channel.subs[0]; // Repeating the one subreddit in the URL avoids this problem :)
                } else {
                    return "r/" + channel.subs.join("+");
                }
            },

            add: function(channel) {
                M.Channels.list.push(channel);
                store.setItem('channels', JSON.stringify(M.Channels.list));
            },

            remove: function(name) {
                for (var j = 0; j < M.Channels.list.length; j++) {
                    if (M.Channels.list[j].name === name) {
                        M.Channels.list.splice(j, 1);
                        break;
                    }
                }
                store.setItem('channels', JSON.stringify(M.Channels.list));
            },

            getByName: function(name) {
                var foundChannel;
                for (var i = 0; i < M.Channels.list.length; i++) {
                    if (M.Channels.list[i].name.toLowerCase() === name.toLowerCase()) {
                        foundChannel = M.Channels.list[i];
                        break;
                    }
                }
                return foundChannel;
            }
        },

        currentSelection: {

            loadSaved: function() {
                var loadedSelection = store.getItem('currentSelection');
                if (loadedSelection) loadedSelection = JSON.parse(loadedSelection);
                M.currentSelection.name = loadedSelection ? loadedSelection.name : 'frontPage';
                M.currentSelection.type = loadedSelection ? loadedSelection.type : selection.sub;
            },

            setSubreddit: function(sub) {
                M.currentSelection.name = sub;
                M.currentSelection.type = selection.sub;
                store.setItem('currentSelection', JSON.stringify(M.currentSelection));
            },

            setChannel: function(channel) {
                M.currentSelection.name = channel.name;
                M.currentSelection.type = selection.channel;
                store.setItem('currentSelection', JSON.stringify(M.currentSelection));
            }
        }
    };

    var V = { // View
        mainWrap: $id("main-wrap"),
        detailWrap: $id("detail-wrap"),
        mainView: $q(".main-view"),
        detailView: $q(".detail-view"),
        subtitle: $id("main-title"),
        subtitleText: $id("sub-title"),
        headerSection: $id("title-head"),
        title: $id("title"),
        headerIcon: $id("header-icon"),
        container: $id("container"),
        btnNavBack: $id("nav-back"),
        footerSub: $id("footer-sub"),
        footerPost: $id("footer-post"),

        Channels: {

            menuContainer: $id("channels"),

            add: function(channel) {
                $append(V.Channels.menuContainer, Mustache.to_html(T.Channels.single, channel));
                if (editingSubs) V.Channels.addToEditList(channel.name);
            },

            loadList: function() {
                $html(V.Channels.menuContainer, Mustache.to_html(T.Channels.list, M.Channels.list));
            },

            remove: function(name) {
                var deletedChannel = $q('.channel-to-remove[data-title="' + name + '"]');
                $addClass(deletedChannel, "anim-delete");
                setTimeout(function() {
                    $remove(deletedChannel);
                }, 200);
                $remove($q('.channel[data-title="' + name + '"]').parentNode);
            },

            showNewChannelForm: function() {
                V.Actions.showModal(T.formAddNewChannel, function() {
                    $id('txt-channel').focus();
                });
            },

            addToEditList: function(name) {
                $append($q(".channel-edit-list"), T.Channels.singleEditItem.replace(/\{\{name\}\}/g, name));
            }
        },

        Subreddits: {

            listContainer: $id("subs"),

            insert: function(subs, active) {
                var subsList = V.Subreddits.listContainer;
                if (subs instanceof Array) {
                    $append(subsList, Mustache.to_html(T.Subreddits.list, subs));
                } else {
                    if (!M.Subreddits.listHasSub(subs)) {
                        var li = $el("li"),
                            p = $el("p", "sub");
                        li.setAttribute("data-name", subs);
                        if (active) $addClass(p, "sub-active");
                        $text(p, subs);
                        $append(li, p);
                        $append(subsList, li);
                        M.Subreddits.add(subs);
                    }
                }
            },

            remove: function(sub) {
                var deletedSub = $q(".sub-to-remove[data-name='" + sub + "']");
                $addClass(deletedSub, "anim-delete");
                setTimeout(function() {
                    $remove(deletedSub);
                }, 200);
                $remove($q("#subs > li[data-name='" + sub + "']"));
            },

            cleanSelected: function() {
                $removeClass($q(".sub-active"), "sub-active");
                $removeClass($q(".channel-active"), "channel-active");
            },

            showManualInput: function() {
                V.Actions.showModal(T.formAgregarSubManual, function() {
                    $id('txt-new-sub').focus();
                });
            },

            showAddingList: function() {
                var main = V.mainWrap;
                $empty(main);
                $append(main, V.Subreddits.addingList);
                $append(main, T.botonCargarMasSubs);
                V.Anims.reveal(main);
            },

            addingList: ''
        },

        Posts: {

            show: function(links, paging) { // links: API raw data
                var linksCount = links.children.length,
                    main = V.mainWrap;

                if (paging) $remove($q(".loader"));
                else $empty(main);

                if (linksCount === 0) {
                    var message = $q('.loader');
                    if (message) {
                        $text(message, "No Links available.");
                        $addClass(message, "loader-error");
                        $append(main, $el("div", "", "main-overflow"));
                    } else {
                        $prepend(main, '<div class="loader loader-error">No Links available.</div><div id="main-overflow"></div>');
                    }
                } else {
                    $append(main, Mustache.to_html(T.Posts, links)); // Add new links to the list

                    // Remove thumbnail space for those links with invalid backgrounds.
                    var thumbs = $qAll('.link-thumb > div'),
                        bgImg = 'background-image: ';
                    for (var i = 0; i < thumbs.length; i++) {
                        var thumb = thumbs[i],
                            bg = thumb.getAttribute('style');
                        if (bg === bgImg + 'url()' || bg === bgImg + 'url(default)' || bg === bgImg + 'url(nsfw)' || bg === bgImg + 'url(self)') {
                            $remove(thumb.parentNode);
                        }
                    }
                }
                // Remove 'More links' button if there are less than 30 links
                if (linksCount < 30) $remove($id("more-links").parentNode);
                if (!paging) V.Anims.reveal(main);
            }
        },

        Actions: {

            setSubTitle: function(title) {
                $text(V.subtitleText, title);
                $text(V.footerSub, title);
            },

            backToMainView: function() {
                $addClass(V.btnNavBack, "invisible");
                $removeClass(V.subtitle, "invisible");
                $empty(V.headerSection);
                $append(V.headerSection, V.headerIcon);
                V.Anims.slideFromLeft();
            },

            moveMenu: function(direction) {
                if (direction === move.left) {
                    $removeClass(V.mainView, css.showMenu);
                    setTimeout(function() {
                        showingMenu = false;
                    });
                }
                if (direction === move.right) {
                    $addClass(V.mainView, css.showMenu);
                    setTimeout(function() {
                        showingMenu = true;
                    });
                }
            },

            loadForAdding: function() {
                if (!isLargeScreen) V.Actions.moveMenu(move.left);
                if (currentView === view.comments) V.Actions.backToMainView();

                setTimeout(function() {
                    var main = V.mainWrap;
                    main.scrollTop = 0; // Go to the container top

                    if (V.Subreddits.addingList) { // is cache'd
                        V.Subreddits.showAddingList();
                    } else {
                        var loader = $el("div", "loader");
                        $prepend(main, loader);

                        JSONP.get(urlInit + "reddits/.json?limit=50", function(list) {
                            M.Subreddits.idLast = list.data.after;
                            V.Subreddits.addingList = Mustache.to_html(T.Subreddits.toAddList, list.data);
                            V.Subreddits.showAddingList();
                        }, function() { // On Error
                            $addClass(loader, "loader-error");
                            $text(loader, "Error loading subreddits.");
                        });
                    }
                    loadingLinks = false;
                }, isLargeScreen ? 1 : 301);
                V.Subreddits.cleanSelected();
                V.Actions.setSubTitle("Add Subs");
                setEditingSubs(true);
            },

            loadForEditing: function() {
                if (!isLargeScreen) V.Actions.moveMenu(move.left);
                if (currentView === view.comments) V.Actions.backToMainView();

                setTimeout(function() {
                    V.mainWrap.scrollTop = 0; // Up to container top
                    var htmlSubs = Mustache.to_html(T.Subreddits.toRemoveList, M.Subreddits.list);
                    var htmlChannels = '';
                    if (M.Channels.list && M.Channels.list.length > 0) {
                        htmlChannels = Mustache.to_html("<p class='edit-subs-title'>Channels</p><ul class='remove-list channel-edit-list'>{{#.}} " + T.Channels.singleEditItem + "{{/.}}</ul>", M.Channels.list);
                    }
                    var html = '<div id="remove-wrap">' + htmlChannels + htmlSubs + "</div>";
                    $html(V.mainWrap, html);
                    V.Anims.reveal(V.mainWrap);

                    V.Subreddits.cleanSelected();
                    loadingLinks = false;
                }, isLargeScreen ? 1 : 301);
                V.Actions.setSubTitle('Edit Subs');
                setEditingSubs(true);
            },

            showModal: function(template, callback) {
                var delay = 1;
                if (!isLargeScreen && showingMenu) {
                    V.Actions.moveMenu(move.left);
                    delay = 301;
                }
                setTimeout(function() {
                    if (esModal) return;
                    var modal = $el("div", '', "modal");
                    $append(modal, template);
                    $append(body, modal);
                    esModal = true;
                    setTimeout(function() {
                        modal.style.opacity = 1;
                        V.Anims.bounceInDown($q(".new-form"));
                    }, 1);
                    if (callback) callback();
                }, delay);
            },

            removeModal: function() {
                var modal = $id('modal');
                modal.style.opacity = '';
                esModal = false;
                setTimeout(function() {
                    $remove(modal);
                }, 301);
            },

            setDetailFooter: function(title) {
                $text(V.footerPost, title ? title : T.noLink);
                var btns = $qAll("#detail-footer .btn-footer");
                for (var i = 0, l = btns.length; i < l; i++) {
                    if (title) $removeClass(btns[i], css.hide);
                    else $addClass(btns[i], css.hide);
                }
            },

            showNotification: function(text) {
                $append(body, T.notification.replace('{{text}}', text));
                var notification = $q('.notification');
                V.Anims.bounceInDown(notification);
                setTimeout(function() {
                    V.Anims.dismiss(notification, function() {
                        $remove(notification);
                    });
                }, (1500 + 500));
            }
        },

        Anims: {

            slideFromLeft: function() {
                var show = css.showView;
                $addClass(V.mainView, show);
                $removeClass(V.detailView, show);
                currentView = view.main;
            },

            slideFromRight: function() {
                var show = css.showView;
                $removeClass(V.mainView, show);
                $addClass(V.detailView, show);
                currentView = view.comments;
            },

            reveal: function(el) {
                var reveal = "anim-reveal";
                $addClass(el, reveal);
                setTimeout(function() {
                    $removeClass(el, reveal);
                }, 700);
            },

            shake: function(el) {
                var shake = "anim-shake";
                $addClass(el, shake);
                setTimeout(function() {
                    $removeClass(el, shake);
                }, 350);
            },

            shakeForm: function() {
                V.Anims.shake($q(".new-form"));
            },

            bounceOut: function(el, callback) {
                var bounceOut = "anim-bounce-out";
                $addClass(el, bounceOut);
                if (callback) setTimeout(callback, 1000);
            },

            bounceInDown: function(el) {
                $addClass(el, "anim-bounceInDown");
                setTimeout(function() {
                    el.style.opacity = 1;
                    $removeClass(el, "anim-bounceInDown");
                }, 500);
            },

            dismiss: function(el, callback) {
                el.style.opacity = '';
                $addClass(el, "anim-dismiss");
                if (callback) setTimeout(callback, 200);
            }
        }
    };

    var C = { // "Controller"

        Posts: {

            load: function(baseUrl, paging) {
                if (loadingLinks) return;
                loadingLinks = true;
                loadingComments = false;
                setEditingSubs(false);
                var main = V.mainWrap,
                    loader = $el("div", "loader");
                if (paging) {
                    // Se quita el boton de 'More' actual
                    $remove($id("more-links").parentNode);
                    $append(main, loader);
                } else {
                    main.scrollTop = 0; // Sube al top del contenedor
                    setTimeout(function() {
                        $prepend(main, loader);
                    }, showingMenu ? 301 : 1);
                    paging = ''; // Si no hay paginacion, se pasa una cadena vacia, para no paginar
                }
                JSONP.get(baseUrl + C.Sorting.get() + urlLimitEnd + paging, function(result) {
                    C.Posts.show(result, paging);
                }, function() { // On error
                    loadingLinks = false;
                    $addClass(loader, "loader-error");
                    $text(loader, "Error loading links. Refresh to try again.");
                });
            },

            loadFromManualInput: function(loadedLinks) {
                C.Posts.show(loadedLinks);
                setEditingSubs(false);
            },

            show: function(result, paging) {
                var links = result.data;
                loadingLinks = false;
                M.Posts.idLast = links.after;

                V.Posts.show(links, paging);
                M.Posts.setList(links);
            }
        },

        Comments: {

            load: function(data, baseElement, idParent) {
                var now = new Date().getTime(),
                    converter = new Markdown.Converter(),
                    comments = $el("section", "comments-level");

                for (var i = 0; i < data.length; i++) {
                    var c = data[i];

                    if (c.kind !== "t1") continue;

                    var html = converter.makeHtml(c.data.body),
                        isPoster = M.Posts.list[currentThread].author === c.data.author,
                        permalink = "http://reddit.com" + M.Posts.list[currentThread].link + c.data.id;

                    var comment = $el("div", "comment-wrap"),
                        wrap = $el("div"),
                        cData = $el("div", "comment-data"),
                        cPoster = $el("div", isPoster ? "comment-poster" : "comment-author"),
                        pPoster = $el("p"),
                        cInfo = $el("div", "comment-info"),
                        aSince = $el("a"),
                        cBody = $el("div", "comment-body");

                    $text(pPoster, c.data.author);

                    aSince.setAttribute("href", permalink);
                    aSince.setAttribute("target", "_blank");
                    $text(aSince, timeSince(now, c.data.created_utc));

                    $html(cBody, html);

                    // Piece together
                    $append(cPoster, pPoster);
                    $append(cData, cPoster);
                    $append(cInfo, aSince);
                    $append(cData, cInfo);
                    $append(wrap, cData);
                    $append(comment, wrap);
                    $append(comment, cBody);

                    if (c.data.replies && c.data.replies.data.children[0].kind !== "more") {
                        var btnReply = $el("span", "comments-button");
                        $addClass(btnReply, "replies-button");
                        btnReply.setAttribute("data-comment-id", c.data.id);
                        $text(btnReply, "See replies");

                        $append(comment, btnReply);

                        replies[c.data.id] = c.data.replies.data.children;
                    }

                    $append(comments, comment);
                }

                $append(baseElement, comments);

                if (idParent) loadedLinks[idParent] = comments;

            },

            show: function(id, refresh) {
                var delay = 0;
                if (showingMenu) {
                    V.Actions.moveMenu(move.left);
                    delay = 301;
                }
                if (!M.Posts.list[id]) return; // Quick fix for missing id
                setTimeout(function() {

                    // Stop if it hasn't finished loading this comments for the first time before trying to load them again
                    if (loadingComments && currentThread && currentThread === id) return;

                    loadingComments = true;
                    currentThread = id;

                    $removeClass(V.btnNavBack, "invisible"); // Show

                    var detail = V.detailWrap;
                    $empty(detail);

                    if (loadedLinks[id] && !refresh) {
                        $append(detail, M.Posts.list[id].summary);
                        $append($id("comments-container"), loadedLinks[id]);
                        C.Misc.updatePostSummary(M.Posts.list[id], id);
                        loadingComments = false;
                    } else {
                        C.Misc.setPostSummary(M.Posts.list[id], id);
                        var url = "http://www.reddit.com" + M.Posts.list[id].link + urlEnd,
                            loader = $el("div", "loader");
                        $append(detail, loader);
                        JSONP.get(url, function(result) {
                            if (currentThread !== id) return; // In case of trying to load a different thread before this one loaded.
                            C.Misc.updatePostSummary(result[0].data.children[0].data, id);
                            $remove(loader);
                            var comments = result[1].data.children;
                            C.Comments.load(comments, $id("comments-container"), id);
                            loadingComments = false;
                        }, function() { // On Error
                            loadingComments = false;
                            $addClass(loader, "loader-error");
                            $text(loader, "Error loading comments. Refresh to try again.");
                        });
                    }

                    if (!refresh) V.Actions.setDetailFooter(M.Posts.list[id].title);

                    if (!refresh && currentView !== view.comments) V.Anims.slideFromRight();

                    if (isWideScreen) {
                        // Refresh active link indicator
                        $removeClass($q(".link.link-selected"), "link-selected");
                        $addClass($q('.link[data-id="' + id + '"]'), "link-selected");
                    }

                    $empty(V.headerSection);
                    $append(V.headerSection, V.title);
                    $text(V.title, M.Posts.list[id].title);
                    $addClass(V.subtitle, "invisible");
                }, delay);
            }
        },

        Subreddits: {

            loadSaved: function() { // Only should execute when first loading the app
                var subs = store.getItem("subreeddits");
                if (subs) subs = JSON.parse(subs);
                M.Subreddits.list = subs;
                if (!M.Subreddits.list) M.Subreddits.setList(defaultSubs); // If it hasn't been loaded to the 'local store', save default subreddits
                V.Subreddits.insert(M.Subreddits.list);
            },

            loadPosts: function(sub) {
                if (sub !== M.currentSelection.name || editingSubs) {
                    var url;
                    if (sub.toUpperCase() === 'frontPage'.toUpperCase()) url = urlInit + "r/" + M.Subreddits.getAllString() + "/";
                    else url = urlInit + "r/" + sub + "/";
                    C.Posts.load(url);
                    C.currentSelection.setSubreddit(sub);
                }
                V.Actions.setSubTitle(sub);
            },

            remove: function(sub) {
                M.Subreddits.remove(sub);
                V.Subreddits.remove(sub);
                if (M.currentSelection.type === selection.sub && M.currentSelection.name === sub) C.currentSelection.setSubreddit('frontPage'); // If it was the current selection
            },

            addFromNewForm: function() {
                var txtSub = $id("txt-new-sub"),
                    subName = txtSub.value;
                if (!subName) {
                    txtSub.setAttribute("placeholder", "Enter a subreddit title!");
                    V.Anims.shakeForm();
                    return;
                }

                V.Anims.bounceOut($q(".new-form"), V.Actions.removeModal);

                JSONP.get(urlInit + "r/" + subName + "/" + C.Sorting.get() + urlLimitEnd, function(data) {
                    C.Posts.loadFromManualInput(data);
                    V.Actions.setSubTitle(subName);
                    V.Subreddits.cleanSelected();
                    C.currentSelection.setSubreddit(subName);
                    V.Subreddits.insert(subName, true);
                }, function() { // On Error
                    alert('Oh oh, the subreddit you entered is not valid...');
                });
            }
        },

        Channels: {

            add: function(title, subreddits) {
                var channel = {
                    name: title,
                    subs: subreddits
                };
                M.Channels.add(channel);
                V.Channels.add(channel);
            },

            loadSaved: function() { // Should only execute when first loading the app
                M.Channels.list = store.getItem('channels');
                if (M.Channels.list) M.Channels.list = JSON.parse(M.Channels.list);
                else M.Channels.list = [defaultChannel]; // Load default channel(s)
                V.Channels.loadList();
            },

            loadPosts: function(channel) {
                C.Posts.load(urlInit + M.Channels.getURL(channel) + '/');
                V.Actions.setSubTitle(channel.name);
                C.currentSelection.setChannel(channel);
            },

            remove: function(name) {
                M.Channels.remove(name);
                V.Channels.remove(name);
                // If it was the current selection
                if (M.currentSelection.type === selection.channel && M.currentSelection.name === name) C.currentSelection.setSubreddit('frontPage');
            },

            edit: function(name) {
                var channelToEdit = M.Channels.getByName(name);
                V.Actions.showModal(T.formEditChannel, function() {
                    // Fill form with current values
                    $id("txt-channel").value = channelToEdit.name;

                    M.Channels.editing = channelToEdit.name;
                    var inputsContainer = $id("subs-for-channel");

                    for (var i = 0, l = channelToEdit.subs.length; i < l; i++) {

                        var inputTemplate = "<input class='field-edit-sub with-clear' type='text' value='{{subName}}'>";

                        $append(inputsContainer, inputTemplate.replace("{{subName}}", channelToEdit.subs[i]));
                    }
                });
            }
        },

        currentSelection: {

            setSubreddit: function(sub) {
                M.currentSelection.setSubreddit(sub);
            },

            setChannel: function(channel) {
                M.currentSelection.setChannel(channel);
            }
        },

        Sorting: {

            get: function() {
                return (currentSortingChoice !== 'hot' ? (currentSortingChoice + '/') : '');
            },

            change: function(sorting) {
                currentSortingChoice = sorting;
                if (editingSubs) return; // No subreddit or channel selected - just change the sorting type
                // Only refresh with the new sorting, when a subreddit or channel is selected
                var delay = 1;
                if (showingMenu) {
                    V.Actions.moveMenu(move.left);
                    delay = 301;
                }
                setTimeout(function() {
                    refreshCurrentStream();
                }, delay);
            }
        },

        Misc: {

            setPostSummary: function(data, postID) {
                // Main content
                var summaryHTML = Mustache.to_html(T.linkSummary, data);
                var imageLink = checkImageLink(M.Posts.list[postID].url);
                if (imageLink) { // If it's an image link
                    summaryHTML += "<section class='preview-container'><img class='image-preview' src='" + imageLink + "' /></section>";
                }
                if (data.selftext) { // If it has selftext
                    var selfText;
                    if (M.Posts.list[postID].selftextParsed) {
                        selfText = M.Posts.list[postID].selftext;
                    } else {
                        var summaryConverter1 = new Markdown.Converter();
                        selfText = summaryConverter1.makeHtml(data.selftext);
                        M.Posts.list[postID].selftext = selfText;
                        M.Posts.list[postID].selftextParsed = true;
                    }
                    summaryHTML += "<section id='selftext'>" + selfText + "</section>";
                }
                summaryHTML += "<section id='comments-container'></section>";
                $append(V.detailWrap, summaryHTML);
                C.Misc.updatePostTime(data.created_utc);
                M.Posts.list[postID].summary = summaryHTML;
                $text(V.footerPost, data.title);
            },

            updatePostSummary: function(data, postID) {
                $id("summary-comment-num").innerText = data.num_comments + (data.num_comments === 1 ? ' comment' : ' comments');
                // Time ago
                C.Misc.updatePostTime(data.created_utc);
                M.Posts.list[postID].num_comments = data.num_comments;
                M.Posts.list[postID].created_utc = data.created_utc;
            },

            updatePostTime: function(time) {
                $id("summary-time").innerText = timeSince(new Date().getTime(), time);
            }
        }
    };

    function checkWideScreen() {
        return mainWindow.width >= 1000;
    }

    function checkLargeScreen() {
        return mainWindow.width >= 490;
    }

    function checkImageLink(url) {
        var matching = url.match(/\.(svg|jpe?g|png|gif)(?:[?#].*)?$|(?:imgur\.com|www.quickmeme\.com\/meme|qkme\.me)\/([^?#\/.]*)(?:[?#].*)?(?:\/)?$/);
        if (!matching) return '';
        if (matching[1]) { // normal image link
            return url;
        } else if (matching[2]) { // imgur or quickmeme link
            if (matching[0].slice(0, 5) === "imgur") return 'http://imgur.com/' + matching[2] + '.jpg';
            else return 'http://i.qkme.me/' + matching[2] + '.jpg';
        } else {
            return null;
        }
    }

    function setEditingSubs(editing) { // editing: boolean
        editingSubs = editing;
        if (isWideScreen) {
            // If it's showing the add or remove subreddits/channels panel, hide the refresh button
            var refreshBtn = $q('#main-footer .footer-refresh');
            refreshBtn.style.display = editing ? 'none' : '';
        }
    }

    function doByCurrentSelection(caseSub, caseChannel) {
        switch (M.currentSelection.type) {
            case selection.sub:
                caseSub();
                break;
            case selection.channel:
                caseChannel();
                break;
        }
    }

    body.addEventListener("submit", function(ev) {
        if (ev.target.parentNode.id === "form-new-sub") {
            ev.preventDefault();
            C.Subreddits.addFromNewForm();
        }
    });

    function goToComments(id) {
        location.hash = '#comments:' + id;
    }

    function refreshCurrentStream() {
        if (editingSubs) return;
        doByCurrentSelection(function() { // if it's subreddit
            if (M.currentSelection.name.toUpperCase() === 'frontPage'.toUpperCase()) C.Posts.load(urlInit + "r/" + M.Subreddits.getAllString() + "/");
            else C.Posts.load(urlInit + "r/" + M.currentSelection.name + "/");
        }, function() { // if it's channel
            C.Channels.loadPosts(M.Channels.getByName(M.currentSelection.name));
        });
    }

    var openURL = function(url) {
        gui.Shell.openExternal(url);
    };

    var openWindow = function(url, width, height) {
        gui.Window.open(url, {
            position: 'center',
            width: width || 800,
            height: height || 600,
            frame: true,
            toolbar: false,
            resize: true
        });
    };

    var importExportData = function() {
        V.Actions.showModal(T.moveData);
    };

    var saveData = function() {
        var data = "{\"channels\": " + store.getItem("channels") + ", \"subreddits\": " + store.getItem("subreeddits") + "}";
        fs.writeFile("data.json", data, function(err) {
            if (err) alert(err);
            else {
                if (!saveLink) {
                    saveLink = document.createElement("a");
                    saveLink.href = "data.json";
                    saveLink.setAttribute("download", "reedditdata.json");
                }
                saveLink.click();
            }
        });
    };

    // Taps
    tappable("#btn-save-data", saveData);

    tappable("#btn-add-new-sub", {
        onTap: C.Subreddits.addFromNewForm
    });

    tappable("#btn-share", {
        onTap: function(e) {
            shareMenu.popup(e.x, e.y);
        },
        allowClick: false
    });

    tappable("#detail-wrap a", { // All link anchors from the detail view
        onTap: function(e, target) {
            openURL(target.getAttribute("href"));
        },
        allowClick: false
    });

    tappable("#btn-submit-channel", {
        onTap: function(e, target) {
            var txtChannelName = $id("txt-channel"),
                operation = target.getAttribute("data-op");
            var channelName = txtChannelName.value;
            if (!channelName) {
                txtChannelName.placeholder = "Enter a Channel name!";
                V.Anims.shakeForm();
                return;
            }

            var subreddits = [];
            var subs = $qAll("#subs-for-channel input");
            for (var i = 0; i < subs.length; i++) {
                var sub = subs[i].value;
                if (!sub) continue;
                subreddits.push(sub);
            }
            if (subreddits.length === 0) {
                subs[0].placeholder = "Enter at least one subreddit!";
                V.Anims.shakeForm();
                return;
            }

            switch (operation) {
                case "save":
                    // Look for Channel name in the saved ones
                    var savedChannel = M.Channels.getByName(channelName);
                    if (savedChannel) { // If it's already saved
                        txtChannelName.value = "";
                        txtChannelName.placeholder = "'" + channelName + "' already exists.";
                        V.Anims.shakeForm();
                        return;
                    }

                    C.Channels.add(channelName, subreddits);

                    break;

                case "update":
                    // Remove current and add new
                    C.Channels.remove(M.Channels.editing);
                    C.Channels.add(channelName, subreddits);

                    break;
            }

            // confirmation feedback
            $remove(target);
            $append($q(".form-left-corner"), "<p class='channel-added-msg'>'" + channelName + "' " + operation + "d. Cool!</p>");

            V.Anims.bounceOut($q(".new-form"), V.Actions.removeModal);
        },
        activeClass: "btn-general-active"
    });

    tappable("#btn-add-another-sub", {
        onTap: function() {
            var container = $id("subs-for-channel");
            $append(container, "<input type='text' placeholder='Extra subreddit'></input>");
            container.scrollTop = container.innerHeight;
        }
    });

    tappable('.channel', {
        onTap: function(e, target) {
            var channel = target;
            var channelName = channel.getAttribute("data-title");
            V.Actions.moveMenu(move.left);
            if (channelName === M.currentSelection.name && !editingSubs) return;
            V.Subreddits.cleanSelected();
            $addClass(channel, "channel-active");
            if (currentView === view.comments) V.Actions.backToMainView();
            C.Channels.loadPosts(M.Channels.getByName(channelName));
        },
        activeClassDelay: 100,
        activeClass: 'link-active'
    });

    tappable(".replies-button", {
        onTap: function(e, target) {
            var parent = target,
                commentID = parent.getAttribute('data-comment-id'),
                comments = replies[commentID];
            C.Comments.load(comments, parent.parentNode);
            $remove(parent);
        },
        activeClass: 'replies-button-active'
    });

    tappable(".sub", {
        onTap: function(e, target) {
            var sub = target;
            V.Actions.moveMenu(move.left);
            C.Subreddits.loadPosts(sub.firstChild.textContent);
            V.Subreddits.cleanSelected();
            $addClass(sub, "sub-active");
            if (currentView === view.comments) V.Actions.backToMainView();
        },
        allowClick: false,
        activeClassDelay: 100,
        activeClass: 'link-active'
    });

    tappable(".btn-to-main", {
        onTap: function() {
            location.hash = "#";
        }
    });

    tappable(".btn-refresh", {
        onTap: function(e) {
            var origin = e.target.getAttribute("data-origin");
            switch (origin) {
                case "footer-main":
                    refreshCurrentStream();
                    break;
                case "footer-detail":
                    if (!currentThread) return;
                    C.Comments.show(currentThread, true);
                    break;
                default:
                    if (currentView === view.comments) {
                        if (!currentThread) return;
                        C.Comments.show(currentThread, true);
                    }
                    if (currentView === view.main) {
                        refreshCurrentStream();
                    }
            }
        }
    });

    tappable(".link", {
        onTap: function(e, target) {
            var comm = target;
            var id = comm.getAttribute("data-id");
            var link = M.Posts.list[id];
            if (link.self || isWideScreen) {
                goToComments(id);
            } else {
                var url = comm.getAttribute("href");
                openURL(url);
            }
        },
        allowClick: false,
        activeClassDelay: 100,
        inactiveClassDelay: 200,
        activeClass: 'link-active'
    });

    tappable(".to-comments", {
        onTap: function(e, target) {
            var id = target.getAttribute('data-id');
            goToComments(id);
        },
        activeClass: 'button-active',
        activeClassDelay: 100
    });

    tappable("#sub-title", {
        onTap: function() {
            if (isLargeScreen) return;
            V.Actions.moveMenu(showingMenu ? move.left : move.right);
        },
        activeClass: 'sub-title-active'
    });

    tappable("#btn-add-subs", {
        onTap: function(e) {
            subsMenu.popup(e.x, e.y - 70);
        }
    });

    tappable("#btn-edit-subs", {
        onTap: V.Actions.loadForEditing
    });

    tappable("#more-links", {
        onTap: function() {
            doByCurrentSelection(function() {
                var url;
                if (M.currentSelection.name.toUpperCase() === 'frontPage'.toUpperCase()) url = urlInit + "r/" + M.Subreddits.getAllString() + "/";
                else url = urlInit + "r/" + M.currentSelection.name + "/";
                C.Posts.load(url, '&after=' + M.Posts.idLast);
            }, function() {
                var channel = M.Channels.getByName(M.currentSelection.name);
                C.Posts.load(urlInit + M.Channels.getURL(channel) + '/', '&after=' + M.Posts.idLast);
            });
        },
        activeClass: 'list-button-active'
    });

    tappable("#btn-sub-man", {
        onTap: function() {
            V.Subreddits.showManualInput();
        },
        activeClass: 'list-button-active'
    });

    tappable("#btn-add-channel", {
        onTap: function() {
            V.Channels.showNewChannelForm();
        },
        activeClass: 'list-button-active'
    });

    tappable('#more-subs', {
        onTap: function(e, target) {
            $remove(target.parentNode);
            var main = V.mainWrap,
                loader = $el("div", "loader");
            $append(main, loader);
            JSONP.get(urlInit + 'reddits/' + urlEnd + '?&after=' + M.Subreddits.idLast, function(list) {
                var nuevosSubs = Mustache.to_html(T.Subreddits.toAddList, list.data);
                M.Subreddits.idLast = list.data.after;
                $remove(loader);
                $append(main, nuevosSubs);
                $append(main, T.botonCargarMasSubs);
                V.Subreddits.addingList += nuevosSubs;
            }, function() {
                $addClass(loader, "loader-error");
                $text(loader, 'Error loading more subreddits.');
            });
        },
        activeClass: 'list-button-active'
    });

    tappable('.btn-add-sub', {
        onTap: function(e, target) {
            var parent = target.parentNode,
                subTitle = parent.querySelector(".subreddit-title");
            subTitle.style.color = "#2b9900"; // 'adding sub' little UI feedback
            var newSub = subTitle.innerText;
            V.Subreddits.insert(newSub);
        },
        activeClass: 'button-active'
    });

    tappable(".btn-remove-subreddit", {
        onTap: function(e, target) {
            C.Subreddits.remove(target.getAttribute('data-name'));
        },
        activeClass: 'button-active'
    });

    tappable(".btn-remove-channel", {
        onTap: function(e, target) {
            C.Channels.remove(target.getAttribute('data-title'));
        },
        activeClass: 'button-active'
    });

    tappable(".btn-edit-channel", {
        onTap: function(e, target) {
            C.Channels.edit(target.getAttribute('data-title'));
        },
        activeClass: 'button-active'
    });

    tappable(".close-form", {
        onTap: function() {
            V.Actions.removeModal();
        }
    });

    tappable('#sorting p', {
        onTap: function(e, target) {
            var choice = target;
            var sortingChoice = choice.textContent;
            if (sortingChoice === currentSortingChoice) return;
            var choices = $qAll(".sorting-choice");
            for (var i = 0, l = choices.length; i < l; i++) {
                $removeClass(choices[i], "sorting-choice");
            }
            $addClass(choice, "sorting-choice");
            C.Sorting.change(sortingChoice);
        },
        activeClass: 'link-active',
        activeClassDelay: 100
    });

    tappable("#imp-exp", {
        onTap: importExportData,
        activeClass: "link-active"
    });

    body.addEventListener("change", function(ev) {
        if (ev.target.id === "btn-import-data") {
            var importPath = ev.target.value;
            if (!importPath) return;
            fs.readFile(importPath, function(err, cont) {
                if (err) throw err;
                else {
                    try {
                        data = JSON.parse(cont.toString());
                        if (data.subreddits) {
                            refresh = true;
                            store.setItem("subreeddits", JSON.stringify(data.subreddits));
                        }
                        if (data.channels) {
                            refresh = true;
                            store.setItem("channels", JSON.stringify(data.channels));
                        }
                        if (refresh) win.location.reload();
                    } catch (e) {
                        alert("Oops. Wrong file, maybe? - Try choosing another one!");
                    }
                }
            });
        }
    });

    // Do stuff after finishing resizing the windows
    win.addEventListener("resizeend", function() {
        isWideScreen = checkWideScreen();
        isLargeScreen = checkLargeScreen();
        if (isLargeScreen && showingMenu) V.Actions.moveMenu(move.left);
        viewOnlyPosts.checked = false;
        viewMenuAndPosts.checked = false;
        viewMenuPostsAndComments.checked = false;
        if (!isLargeScreen) viewOnlyPosts.checked = true;
        else if (isLargeScreen && !isWideScreen) viewMenuAndPosts.checked = true;
        else viewMenuPostsAndComments.checked = true;
    }, false);

    // Pseudo-hash-router
    win.addEventListener('hashchange', function() {
        if (location.hash === "") {
            V.Actions.backToMainView();
            $removeClass($q('.link-selected'), 'link-selected');
            V.Actions.setDetailFooter("");
            setTimeout(function() {
                $empty(V.detailWrap);
            }, isWideScreen ? 1 : 301);
        } else {
            var match = location.hash.match(/(#comments:)((?:[a-zA-Z0-9]*))/);
            if (match && match[2]) {
                var id = match[2];
                C.Comments.show(id);
            }
        }
    }, false);

    $q("#header-icon").addEventListener("dblclick", function() {
        mainWindow.height = 1048;
        // require('nw.gui').Window.get().showDevTools();
    });

    $id("btn-new-sub").addEventListener("click", function() {
        V.Subreddits.showManualInput();
    });

    $id("btn-new-channel").addEventListener("click", function() {
        V.Channels.showNewChannelForm();
    });

    // App init
    win.onload = function() {

        $remove(V.title);

        var winConfig = store.getItem("win:config");

        if (winConfig) {
            winConfig = JSON.parse(winConfig);

            var mainWinWidth = winConfig.w,
                mainWinHeight = winConfig.h,
                mainWinX = winConfig.x,
                mainWinY = winConfig.y;

            if (mainWinHeight && mainWinWidth) {
                mainWindow.width = mainWinWidth;
                mainWindow.height = mainWinHeight;
            }

            if (mainWinX && mainWinY) {
                mainWindow.x = mainWinX;
                mainWindow.y = mainWinY;
            }
        }

        if (checkWideScreen()) $text(V.footerPost, T.noLink);

        M.currentSelection.loadSaved();

        C.Subreddits.loadSaved();
        C.Channels.loadSaved();

        // Cargar links y marcar como activo al subreddit actual - la 1ra vez sera el 'frontPage'
        doByCurrentSelection(function() { // En caso de ser un subreddit
            var i = M.Subreddits.list.indexOf(M.currentSelection.name);
            if (i > -1) {
                var activeSub = doc.getElementsByClassName('sub')[i];
                $addClass(activeSub, "sub-active");
            }
            // Load links
            if (M.currentSelection.name.toUpperCase() === 'frontPage'.toUpperCase()) {
                C.currentSelection.setSubreddit('frontPage');
                C.Posts.load(urlInit + "r/" + M.Subreddits.getAllString() + "/");
            } else {
                C.Posts.load(urlInit + "r/" + M.currentSelection.name + "/");
            }
            V.Actions.setSubTitle(M.currentSelection.name);
        }, function() { // If it's a channel
            var channel;
            for (var i = 0; i < M.Channels.list.length; i++) {
                channel = M.Channels.list[i];
                if (channel.name === M.currentSelection.name) {
                    var active = doc.getElementsByClassName('channel')[i];
                    $addClass(active, 'channel-active');
                    break;
                }
            }
            C.Channels.loadPosts(channel);
        });

        mainWindow.show();
        mainWindow.focus();
    };

    // Share Menu
    var shareMenu = new gui.Menu();
    shareMenu.append(new gui.MenuItem({
        label: 'Reading List',
        click: function() {
            sharing.readingList(M.Posts.list[currentThread].url, function() {
                V.Actions.showNotification("Added to Reading List");
            });
        }
    }));
    shareMenu.append(new gui.MenuItem({
        label: 'Copy Link',
        click: function() {
            sharing.clipboard(M.Posts.list[currentThread].url);
            V.Actions.showNotification("Copied to Clipboard");
        }
    }));
    shareMenu.append(new gui.MenuItem({
        label: 'Twitter',
        click: function() {
            var url = M.Posts.list[currentThread].url,
                title = M.Posts.list[currentThread].title;
            openWindow("https://twitter.com/intent/tweet?text=\"" + encodeURI(title) + "\" —&url=" + url + "&via=ReedditApp&related=ReedditApp", 520, 430);
        }
    }));
    shareMenu.append(new gui.MenuItem({
        label: 'Email',
        click: function() {
            var title = M.Posts.list[currentThread].title,
                url = M.Posts.list[currentThread].url;
            openURL("mailto:?subject=" + title + "&body=" + url + "%0A%0a%0A%0aShared via @ReedditApp.");
        }
    }));

    var subsMenu = new gui.Menu();
    subsMenu.append(new gui.MenuItem({
        label: "Add Subreddit from List",
        click: V.Actions.loadForAdding
    }));

    subsMenu.append(new gui.MenuItem({
        label: "Add Subreddit Manually",
        click: V.Subreddits.showManualInput
    }));

    subsMenu.append(new gui.MenuItem({
        type: 'separator'
    }));

    subsMenu.append(new gui.MenuItem({
        label: 'Create Channel',
        click: V.Channels.showNewChannelForm
    }));

    // Title Menu
    var submenu = new gui.Menu();
    submenu.append(new gui.MenuItem({
        label: 'Add Subscriptions',
        click: V.Actions.loadForAdding
    }));

    submenu.append(new gui.MenuItem({
        type: 'separator'
    }));

    submenu.append(new gui.MenuItem({
        label: 'Insert Subreddit Manually',
        click: V.Subreddits.showManualInput
    }));

    submenu.append(new gui.MenuItem({
        label: 'Create Channel',
        click: V.Channels.showNewChannelForm
    }));

    submenu.append(new gui.MenuItem({
        type: 'separator'
    }));

    submenu.append(new gui.MenuItem({
        label: 'Edit Subscriptions',
        click: V.Actions.loadForEditing
    }));
    submenu.append(new gui.MenuItem({
        type: 'separator'
    }));

    submenu.append(new gui.MenuItem({
        label: 'Import & Export Data',
        click: importExportData
    }));

    var menu = new gui.Menu({
        type: 'menubar'
    });

    menu.append(new gui.MenuItem({
        label: 'Subscriptions',
        submenu: submenu
    }));

    var viewSubmenu = new gui.Menu(),
        viewOnlyPosts = new gui.MenuItem({
            label: 'Only Posts',
            type: 'checkbox',
            click: function() {
                mainWindow.width = 354;
            }
        }),
        viewMenuAndPosts = new gui.MenuItem({
            label: 'Sidebar and Posts',
            type: 'checkbox',
            click: function() {
                mainWindow.width = 490;
            }
        }),
        viewMenuPostsAndComments = new gui.MenuItem({
            label: 'Sidebar, Posts and Comments',
            type: 'checkbox',
            click: function() {
                mainWindow.width = 1000;
            }
        });

    viewSubmenu.append(viewOnlyPosts);
    viewSubmenu.append(viewMenuAndPosts);
    viewSubmenu.append(viewMenuPostsAndComments);
    menu.append(new gui.MenuItem({
        label: 'View',
        submenu: viewSubmenu
    }));

    gui.Window.get().menu = menu; // Add menu to main app window/title bar

    mainWindow.on("close", function() {
        // Save latest window size and position before closing

        var winConfig = {
            w: mainWindow.width,
            h: mainWindow.height,
            x: mainWindow.x,
            y: mainWindow.y
        };

        store.setItem("win:config", JSON.stringify(winConfig));

        mainWindow.close(true);
    });

    mainWindow.on("blur", function() {
        $addClass(body, "inactive");
    });

    mainWindow.on("focus", function() {
        $removeClass(body, "inactive");
    });

    var fs = require("fs"),
        saveLink;

    // Check updates
    setTimeout(function() {
        ajax({
            url: "http://mac.reedditapp.com/version.json",
            dataType: "json",
            success: function(data) {
                if (!data.update.trigger || data.version.number <= version) return;
                // show update button
                var btnShowUpdate = $el("div", "btn-general");
                btnShowUpdate.innerText = "New Reeddit version available";
                btnShowUpdate.style.margin = "10px";
                btnShowUpdate.addEventListener("click", function() {
                    V.Actions.showModal(Mustache.to_html(T.updater, data), function() {
                        $id("btn-download").addEventListener("click", function() {
                            openURL(this.getAttribute("data-link"));
                        });
                    });
                });
                $prepend(V.mainWrap, btnShowUpdate);
            }
        });
    }, 3000);

})(window);
