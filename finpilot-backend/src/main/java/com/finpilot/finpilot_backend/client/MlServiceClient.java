package com.finpilot.finpilot_backend.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import com.finpilot.finpilot_backend.dto.ParsedStatementResponse;

@Component
public class MlServiceClient {
    private final RestTemplate restTemplate;
    private final String mlServiceUrl;

    public MlServiceClient(@Value("${ml.service.url}") String mlServiceUrl) {
        this.mlServiceUrl = mlServiceUrl;
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(120000);
        this.restTemplate = new RestTemplate(factory);
    }

    public ParsedStatementResponse parseStatement(byte[] fileBytes, String password) {
        ByteArrayResource fileResource = new ByteArrayResource(fileBytes) {
            @Override
            public String getFilename() {
                return "statement.pdf";
            }
        };
        MultiValueMap<String, Object> map = new LinkedMultiValueMap<>();
        map.add("file", fileResource);
        if (password != null) {
            map.add("password", password);
        }
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(map, headers);
        return restTemplate.postForObject(mlServiceUrl + "/parse-transactions", request, ParsedStatementResponse.class);
    }

}