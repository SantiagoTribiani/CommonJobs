﻿/// <reference path="../../Scripts/jquery-1.7.2-vsdoc.js" />
/// <reference path="../../Scripts/underscore.js" />
/// <reference path="../../Scripts/backbone.js" />
/// <reference path="../../Scripts/url-generator.js" />

var QuickSearchPage = function (config) {
    this._init(config);
};

QuickSearchPage.prototype = {
    _defaultConfig: {
        pageSize: 128,
        quickSearchSelector: "#quickSearch",
        resultsSelector: ".results",
        resultCountSelector: "#resultCount",
        cardTemplateSelector: "#card-template",
        addnewCardTemplateSelector: "#add-new-card-template",
        getMoreCardsTemplateSelector: "#get-more-items-template",
        getMoreCardsSelector: ".get-more-items",
        readyClass: "ready",
        loadingClass: "loading",
        prepareNewCard: function ($card) { },
        prepareResultCard: function ($card, item) { }
    },
    generateRedirectUrl: function (searchParameters) {
        throw "generateRedirectUrl is not implemented";
    },
    generateSearchUrl: function (searchParameters) {
        throw "generateSearchUrl is not implemented";
    },
    fillOtherSearchParameters: function (searchParameters) {
        throw "fillOtherSearchParameters is not implemented";
    },
    clean: function () {
        self._lastSearchParameters = null;
        self._previousQuickSearchText = "";
        self._previousXHR = null;
        self._skip = 0;
    },
    _init: function (config) {
        var self = this;
        self._config = $.extend({}, this._defaultConfig, config);
        self.clean();

        self.$quickSearch = $(self._config.quickSearchSelector);
        self.$results = $(self._config.resultsSelector);
        self.$resultCount = $(self._config.resultCountSelector);
        self.cardTemplate = _.template($(self._config.cardTemplateSelector).text());
        self.addNewCardTemplate = _.template($(self._config.addnewCardTemplateSelector).text());
        self.getMoreCardsTemplate = _.template($(self._config.getMoreCardsTemplateSelector).text());

        $(window).unload(function () {
            self.clean();
        });
        this.$results.on("click", self._config.getMoreCardsSelector + "." + self._config.readyClass, function (e) {
            self.getNextPage();
        });
        this.$quickSearch.bind('input', function (e) {
            var current = self.$quickSearch.val();
            if (current != self._previousQuickSearchText) {
                self._previousQuickSearchText = current;
                self.search();
            }
        });
        this.$quickSearch.focus();
        this.$quickSearch.select();
        this.$results.append(this.getMoreCardsTemplate());
    },
    getSearchParameters: function () {
        var searchParameters = {};

        var term = this.$quickSearch.val();
        if (term)
            searchParameters.term = term;

        this._config.fillOtherSearchParameters(searchParameters);

        return searchParameters;
    },
    redirect: function (searchParameters) {
        if (!searchParameters)
            searchParameters = this.getSearchParameters();
        location.href = this._config.generateRedirectUrl(searchParameters);
    },
    executeSearchQuery: function (searchParameters) {
        var self = this;
        self._startLoading();
        if (self._previousXHR)
            self._previousXHR.abort();

        self._previousXHR = $.ajax({
            cache: false,
            type: "GET",
            url: self._config.generateSearchUrl(searchParameters)
        }).done(function (result) {
            self._previousXHR = null;
            self._skip = 0;
            self._lastSearchParameters = searchParameters;
            self._appendNewCard();
            self._appendResults(result);
        });
    },
    search: function (searchParameters) {
        var self = this;
        if (!searchParameters)
            searchParameters = self.getSearchParameters();
        if (self._config.pageSize)
            searchParameters.Take = self._config.pageSize;

        if (self._timeoutToSearch) clearTimeout(self._timeoutToSearch);
        self._timeoutToSearch = setTimeout(function() {
            self.executeSearchQuery(searchParameters);
        }, 300);
    },
    _appendNewCard: function () {
        var self = this;
        var newCardElement = $(self.addNewCardTemplate());

        if (self._config.prepareNewCard) {
            self._config.prepareNewCard(newCardElement);
        }
        
        self.$results.html(null);
        self.$results.append(newCardElement);
    },
    _startLoading: function () {
        $(this._config.getMoreCardsSelector).removeClass(this._config.readyClass).addClass(this._config.loadingClass);
    },
    getNextPage: function () {
        var self = this;
        self._startLoading();
        var parameters = _.extend({}, self._lastSearchParameters, { Skip: self._skip });
        $.ajax({
            cache: false,
            type: "GET",
            url: self._config.generateSearchUrl(parameters)
        })
        .done(function (result) {
            self.$results.find(self._config.getMoreCardsSelector).remove();
            self._appendResults(result);
        });
    },
    _appendResults: function (result) {
        var self = this;
        this.$resultCount.html(result.TotalResults);

        for (var i in result.Items) {
            var item = result.Items[i];
            var $card = $(this.cardTemplate({ item: item }));
            if (self._config.prepareResultCard) {
                self._config.prepareResultCard($card, item);
            }
            this.$results.append($card);
        }

        this._skip = this._skip + result.Items.length;
        if (this._skip < result.TotalResults) {
            this.$results.append(this.getMoreCardsTemplate());
            $(this._config.getMoreCardsSelector).removeClass(this._config.loadingClass).addClass(this._config.readyClass);
        }
    }

};


