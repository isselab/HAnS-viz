// Copyright 2021 Kenny Bang, Johan Berg, Seif Bourogaa, Lucas Frövik, Alexander Grönberg, Sara Persson

package com.github.johmara.hansviz.browser;

import org.cef.browser.CefBrowser;
import org.cef.browser.CefFrame;
import org.cef.callback.CefSchemeHandlerFactory;
import org.cef.handler.CefResourceHandler;
import org.cef.network.CefRequest;

/**
 * A class creating a custom CefResourceHandler
 * @see BrowserResourceHandler
 */
public class BrowserSchemeHandlerFactory implements CefSchemeHandlerFactory {
    /**
     * Creates a new custom CefResourceHandler
     * @return A new resource handler
     */
    @Override
    public CefResourceHandler create(CefBrowser cefBrowser, CefFrame cefFrame, String s, CefRequest cefRequest) {
        return new BrowserResourceHandler();
    }
}
