// Copyright 2021 Kenny Bang, Johan Berg, Seif Bourogaa, Lucas Frövik, Alexander Grönberg, Sara Persson
package com.github.johmara.hansviz;

import org.cef.callback.CefCallback;
import org.cef.handler.CefLoadHandler;
import org.cef.misc.IntRef;
import org.cef.misc.StringRef;
import org.cef.network.CefResponse;

import java.io.IOException;
import java.io.InputStream;
import java.net.URLConnection;

/**
 * A class representing an open connection to a resource
 */
class OpenedConnection implements ResourceHandlerState {

    private final InputStream inputStream;
    private final URLConnection connection;

    public OpenedConnection(URLConnection connection) throws IOException {
        inputStream = connection.getInputStream();
        this.connection = connection;
    }

    @Override
    public void getResponseHeaders(CefResponse cefResponse, IntRef responseLength, StringRef redirectUrl) {
        try {
            String url = connection.getURL().toString();
            if (url.contains("css")) {
                cefResponse.setMimeType("text/css");
            } else if (url.contains("js")) {
                cefResponse.setMimeType("text/javascript");
            } else if (url.contains("html")) {
                cefResponse.setMimeType("text/html");
            }else {
                cefResponse.setMimeType(connection.getContentType());
            }
            responseLength.set(inputStream.available());
            cefResponse.setStatus(200);
        } catch (IOException e) {
            cefResponse.setError(CefLoadHandler.ErrorCode.ERR_FILE_NOT_FOUND);
            cefResponse.setStatusText(e.getLocalizedMessage());
            cefResponse.setStatus(404);
        }
    }

    @Override
    public boolean readResponse(byte[] dataOut, int designedBytesToRead, IntRef bytesRead, CefCallback callback) throws IOException {
        int availableSize = inputStream.available();
        if (availableSize > 0) {
            // Calculate how many bytes should be read
            int maxBytesToRead = Math.min(availableSize, designedBytesToRead);
            // Set how many bytes was actually read
            int realNumberOfReadBytes = inputStream.read(dataOut, 0, maxBytesToRead);
            bytesRead.set(realNumberOfReadBytes);
            return true;
        } else {
            // If failure to read, close connection
            inputStream.close();
            return false;
        }
    }

    /**
     * Closes the connection to resource
     */
    @Override
    public void close() throws IOException {
        inputStream.close();
    }
}
