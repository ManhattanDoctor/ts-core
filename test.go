func (bp *BlockParser) disassemblies(block *common.Block) {
	md, _ := GetMetadataFromBlock(block, common.BlockMetadataIndex_SIGNATURES)
	for _, sign := range md.Signatures {
		sh := &common.SignatureHeader{}
		err := Deserialize(sign.SignatureHeader, sh)
		if err != nil {
			out.Logger.Errorf("Error unmarshal events: %s", err.Error())
		} else {
			if cn, sn, cert, ok := GetSignIdentity(sh.GetCreator()); ok {
				out.Logger.Debugf("Block %d => Orderer CN: %s; SerialNumber: %s \n", block.Header.GetNumber(), cn, sn)
				bp.total.BuildUp(NewItem(ThisOrderer, cn, sn, cert), block.Header.GetNumber())
			}
		}
	}
	for _, tx := range block.Data.Data {
		envelop, err := UnmarshalEnvelope(tx)
		if err != nil {
			out.Logger.Errorf("Error unmarshal envelope of %d: %s", block.Header.GetNumber(), err.Error())
			continue
		}
		payload, err := ExtractPayload(envelop)
		if err != nil {
			out.Logger.Errorf("Error unmarshal payload of %d: %s", block.Header.GetNumber(), err.Error())
			continue
		}
		chHeader, err := UnmarshalChannelHeader(payload.Header.ChannelHeader)
		if err != nil {
			out.Logger.Errorf("Error unmarshal channel header of %d: %s", block.Header.GetNumber(), err.Error())
			continue
		}
		if common.HeaderType(chHeader.GetType()) != common.HeaderType_ENDORSER_TRANSACTION {
			continue
		}
		if chHeader.GetChannelId() != bp.cfg.Channel {
			continue
		}
		pTx, err := GetTransaction(payload.GetData())
		if err != nil {
			out.Logger.Errorf("Error extract peer transaction of %d: %s", block.Header.GetNumber(), err.Error())
			continue
		}
		for _, action := range pTx.GetActions() {
			cap, ca, err := GetPayloads(action)
			if err != nil {
				out.Logger.Errorf("Error extract payload of action: %s", err.Error())
				continue
			}
			ccEvent := &peer.ChaincodeEvent{}
			err = Deserialize(ca.GetEvents(), ccEvent)
			if err != nil {
				out.Logger.Errorf("Error unmarshal events: %s", err.Error())
				continue
			}
			// Score only selected chaincode
			if ccEvent.GetChaincodeId() != bp.cfg.ChainCodeId {
				continue
			}
			buf, err := GetBytesChaincodeActionPayload(cap)
			if err != nil {
				out.Logger.Errorf("Error unmarshal chaincode action payload: %s", err.Error())
				continue
			}
			ccAPayload, err := GetChaincodeActionPayload(buf)
			if err != nil {
				out.Logger.Errorf("Error extract payload of chaincode action: %s", err.Error())
				continue
			}
			for _, end := range ccAPayload.GetAction().GetEndorsements() {
				if cn, sn, cert, ok := GetSignIdentity(end.GetEndorser()); ok {
					out.Logger.Debugf("Endorser CN: %s; SerialNumber: %s \n", cn, sn)
					bp.total.BuildUp(NewItem(ThisPeer, cn, sn, cert))
				}
			}
		}
	}
}