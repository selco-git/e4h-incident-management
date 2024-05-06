package org.egov.im.web.controllers;

import java.io.IOException;
import java.util.Map;

import javax.validation.Valid;

import org.egov.im.service.MigrationService;
import org.egov.im.web.models.imV1.ServiceResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import lombok.extern.slf4j.Slf4j;

@ConditionalOnProperty(
        value="migration.enabled",
        havingValue = "true",
        matchIfMissing = false)
@RestController
@RequestMapping("/migration")
@Slf4j
public class MigrationController {


    @Autowired
    private MigrationService migrationService;


    @RequestMapping(value="/_transform", method = RequestMethod.POST)
    public ResponseEntity<Map> requestsCreatePost(@Valid @RequestBody ServiceResponse request) throws IOException {

        Map<String, Object> response = migrationService.migrate(request);

        return new ResponseEntity<>(response, HttpStatus.OK);

    }
}
