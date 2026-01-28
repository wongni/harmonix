package com.example.app;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import java.lang.management.ManagementFactory;
import java.util.Map;

@Path("/")
public class HealthResource {

    @GET
    @Produces(MediaType.TEXT_PLAIN)
    public String root() {
        return "OK";
    }

    @GET
    @Path("health")
    @Produces(MediaType.APPLICATION_JSON)
    public Map<String, Object> health() {
        long uptime = ManagementFactory.getRuntimeMXBean().getUptime() / 1000;
        return Map.of(
            "uptime", uptime,
            "status", "OK"
        );
    }
}
