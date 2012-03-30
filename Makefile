CURL := curl

HOST := localhost
PORT := 7379

FILES := .index.xhtml.up .js-wikdis.js.up

.%.up: % Makefile
	@echo "Uploading $<... "
	$(CURL) $(CURLOPTS) --upload-file $< "http://$(HOST):$(PORT)/SET/$(basename $<)" &> /dev/null
	@touch .$<.up

all: $(FILES)
