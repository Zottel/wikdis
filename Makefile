CURL := curl

HOST := localhost
PORT := 7379

FILES := .index.xhtml.up .js-wikdis.js.up .js-jquery.js.up .js-jquery-tmpl.js.up .css-screen.css.up

.%.up: % Makefile
	@echo "Uploading $<... "
	$(CURL) $(CURLOPTS) --upload-file $< "http://$(HOST):$(PORT)/SET/$(basename $<)" &> /dev/null
	@touch .$<.up

all: $(FILES)
